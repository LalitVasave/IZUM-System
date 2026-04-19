import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../utils/db';
import redis from '../utils/redis';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  role: z.enum(["student", "driver", "admin"]),
  college_id: z.string().optional(),
  license_no: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const data = RegisterSchema.parse(request.body);
    
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return reply.code(409).send({ error: "EMAIL_TAKEN", message: "This email is already registered" });
    }

    const hashed_password = await bcrypt.hash(data.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          hashed_password,
          role: data.role,
        }
      });

      if (data.role === 'student') {
        const college_id_hash = data.college_id ? crypto.createHash('sha256').update(data.college_id).digest('hex') : null;
        await tx.student.create({
          data: {
            user_id: newUser.id,
            name: data.name,
            college_id_hash,
          }
        });
      } else if (data.role === 'driver') {
        await tx.driver.create({
          data: {
            user_id: newUser.id,
            license_no: data.license_no,
          }
        });
      }

      return newUser;
    });

    const tokenBytes = crypto.randomBytes(32).toString('hex');
    const verify_token = crypto.createHash('sha256').update(tokenBytes).digest('hex');

    await prisma.authToken.create({
      data: {
        user_id: user.id,
        type: 'VERIFY',
        token: verify_token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    // MOCK EMAIL SEND (token logged server-side only)
    fastify.log.info(`[MOCK EMAIL] Verification Link: http://localhost:5173/verify?token=${tokenBytes}`);

    const registrationResponse: Record<string, unknown> = {
      message: "Please check your email to verify your account.",
      user: { id: user.id, email: user.email, role: user.role }
    };
    if (process.env.NODE_ENV !== 'production') {
      registrationResponse.mock_verification_link = `http://localhost:5173/verify?token=${tokenBytes}`;
    }
    return reply.code(201).send(registrationResponse);
  });

  fastify.post('/login', async (request, reply) => {
    const data = LoginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS" });
    }

    const isValid = await bcrypt.compare(data.password, user.hashed_password);
    if (!isValid) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS" });
    }

    if (!user.verified && process.env.NODE_ENV === 'production') {
      return reply.code(403).send({ error: "EMAIL_NOT_VERIFIED", message: "Please verify your email before logging in." });
    }

    if (!user.verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true }
      });
      user.verified = true;
      fastify.log.info(`Auto-verified ${user.email} for local demo login.`);
    }

    const jti = crypto.randomUUID();
    const access_token = await signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refresh_token = await signRefreshToken({ id: user.id }, jti);

    await prisma.refreshToken.create({
      data: { jti, user_id: user.id, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    });
    
    await redis.set(`session:${jti}`, user.id, 'EX', 900);
    await redis.set(`refresh:${jti}`, user.id, 'EX', 7 * 24 * 60 * 60);

    reply.setCookie('refresh_token', refresh_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return reply.code(200).send({
      access_token,
      token_type: "bearer",
      user: { id: user.id, email: user.email, role: user.role }
    });
  });

  fastify.post('/refresh', async (request, reply) => {
    const token = request.cookies.refresh_token;
    if (!token) return reply.code(401).send({ error: "NO_TOKEN" });

    try {
      const payload = await verifyToken(token);
      const jti = payload.jti as string;
      const user_id = payload.id as string;

      // 1. Check if token is in Redis (revocation check)
      const stored = await redis.get(`refresh:${jti}`);
      if (!stored) {
        // Potential Token Reuse Detected!
        // Revoke ALL tokens for this user for safety
        await prisma.refreshToken.updateMany({ where: { user_id }, data: { revoked: true } });
        return reply.code(401).send({ error: "TOKEN_REUSE_DETECTED" });
      }

      // 2. Consume the old token (Delete from Redis)
      await redis.del(`refresh:${jti}`);
      await prisma.refreshToken.updateMany({ where: { jti }, data: { revoked: true } });

      const user = await prisma.user.findUnique({ where: { id: user_id } });
      if (!user) return reply.code(401).send({ error: "USER_NOT_FOUND" });

      // 3. Issue NEW Access & Refresh Token (Rotation)
      const newJti = crypto.randomUUID();
      const access_token = await signAccessToken({ id: user.id, email: user.email, role: user.role });
      const new_refresh_token = await signRefreshToken({ id: user.id }, newJti);

      // 4. Store the new token
      await prisma.refreshToken.create({
        data: { jti: newJti, user_id: user.id, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      });
      await redis.set(`refresh:${newJti}`, user.id, 'EX', 7 * 24 * 60 * 60);

      // 5. Update the cookie
      reply.setCookie('refresh_token', new_refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.send({ access_token });
    } catch (err) {
      return reply.code(401).send({ error: "INVALID_TOKEN" });
    }
  });

  fastify.post('/logout', async (request, reply) => {
    const token = request.cookies.refresh_token;
    if (token) {
      try {
        const payload = await verifyToken(token);
        const jti = payload.jti as string;
        await redis.del(`refresh:${jti}`);
        await prisma.refreshToken.updateMany({
          where: { jti },
          data: { revoked: true }
        });
      } catch (err) {}
    }

    reply.clearCookie('refresh_token');
    return reply.send({ success: true });
  });

  fastify.get('/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: "UNAUTHORIZED" });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.id as string },
        select: { id: true, email: true, role: true, student: true, driver: true }
      });
      if (!user) return reply.code(401).send({ error: "UNAUTHORIZED" });
      
      return reply.send({ user });
    } catch (err) {
      return reply.code(401).send({ error: "UNAUTHORIZED" });
    }
  });

  fastify.post('/verify', async (request, reply) => {
    const { token } = request.body as { token: string };
    if (!token) return reply.code(400).send({ error: 'TOKEN_REQUIRED' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const authToken = await prisma.authToken.findUnique({ where: { token: hashedToken } });

    if (!authToken || authToken.type !== 'VERIFY' || authToken.expires_at < new Date()) {
      return reply.code(400).send({ error: 'INVALID_OR_EXPIRED_TOKEN' });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: authToken.user_id }, data: { verified: true } }),
      prisma.authToken.delete({ where: { id: authToken.id } })
    ]);

    return reply.send({ success: true, message: "Email verified successfully" });
  });

  fastify.post('/forgot-password', async (request, reply) => {
    const { email } = request.body as { email: string };
    if (!email) return reply.code(400).send({ error: 'EMAIL_REQUIRED' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 anyway to prevent email enumeration
      return reply.send({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    const tokenBytes = crypto.randomBytes(32).toString('hex');
    const reset_token = crypto.createHash('sha256').update(tokenBytes).digest('hex');

    // Delete existing reset tokens for this user
    await prisma.authToken.deleteMany({ where: { user_id: user.id, type: 'RESET' } });

    await prisma.authToken.create({
      data: {
        user_id: user.id,
        type: 'RESET',
        token: reset_token,
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
      }
    });

    fastify.log.info(`[MOCK EMAIL] Password Reset Link: http://localhost:5173/reset-password?token=${tokenBytes}`);

    const resetResponse: Record<string, unknown> = {
      success: true,
      message: "If an account exists, a reset link has been sent.",
    };
    if (process.env.NODE_ENV !== 'production') {
      resetResponse.mock_reset_link = `http://localhost:5173/reset-password?token=${tokenBytes}`;
    }
    return reply.send(resetResponse);
  });

  fastify.post('/reset-password', async (request, reply) => {
    const { token, password } = request.body as { token: string, password: string };
    if (!token || !password) return reply.code(400).send({ error: 'BAD_REQUEST' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const authToken = await prisma.authToken.findUnique({ where: { token: hashedToken } });

    if (!authToken || authToken.type !== 'RESET' || authToken.expires_at < new Date()) {
      return reply.code(400).send({ error: 'INVALID_OR_EXPIRED_TOKEN' });
    }

    const hashed_password = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: authToken.user_id }, data: { hashed_password } }),
      prisma.authToken.delete({ where: { id: authToken.id } }),
      prisma.refreshToken.updateMany({ where: { user_id: authToken.user_id }, data: { revoked: true } })
    ]);

    return reply.send({ success: true, message: "Password reset successfully" });
  });
}
