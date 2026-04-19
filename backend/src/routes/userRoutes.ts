import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import prisma from '../utils/db';
import { verifyToken } from '../utils/jwt';
import crypto from 'crypto';
import axios from 'axios';
import redis from '../utils/redis';

const CreateRouteSchema = z.object({
  name: z.string().min(1).max(60),
  stop_ids: z.array(z.string().uuid()).max(12),
});

const UpdateRouteSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  stop_ids: z.array(z.string().uuid()).max(12).optional(),
});

type ShareParams = { Params: { token: string } };
type IdParams = { Params: { id: string } };
type EtaParamsQuery = { Params: { id: string }; Querystring: { bus_id?: string } };

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get<ShareParams>('/shared/:token', async (request, reply) => {
    const { token } = request.params;
    const shared = await prisma.sharedRoute.findUnique({
      where: { token },
      include: { route: true },
    });

    if (!shared) return reply.code(404).send({ error: 'NOT_FOUND' });
    if (shared.expires_at < new Date()) {
      return reply.code(410).send({ error: 'EXPIRED', message: 'This shared link has expired.' });
    }

    await prisma.sharedRoute.update({
      where: { token },
      data: { view_count: { increment: 1 } },
    });

    const stops = await prisma.stop.findMany({
      where: { id: { in: shared.route.stop_ids } },
    });

    const ordered = shared.route.stop_ids
      .map((id) => stops.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));

    return reply.send({
      name: shared.route.name,
      stops: ordered,
    });
  });

  const protectedHeaderCheck = async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token);
      const student = await prisma.student.findUnique({
        where: { user_id: payload.id as string },
      });
      if (!student) {
        return reply.code(403).send({ error: 'STUDENT_ROLE_REQUIRED' });
      }
      request.student = student;
    } catch {
      return reply.code(401).send({ error: 'UNAUTHORIZED' });
    }
  };

  fastify.get('/routes', { preHandler: protectedHeaderCheck }, async (request, reply) => {
    const student = request.student!;
    const routes = await prisma.userCustomRoute.findMany({
      where: { student_id: student.id, deleted_at: null },
      orderBy: { created_at: 'asc' },
    });
    return reply.send({ routes });
  });

  fastify.post('/routes', { preHandler: protectedHeaderCheck }, async (request, reply) => {
    const student = request.student!;
    const data = CreateRouteSchema.parse(request.body);
    const newRoute = await prisma.userCustomRoute.create({
      data: {
        student_id: student.id,
        name: data.name,
        stop_ids: data.stop_ids,
      },
    });
    return reply.code(201).send({ route: newRoute });
  });

  fastify.patch<IdParams>('/routes/:id', { preHandler: protectedHeaderCheck }, async (request, reply) => {
    const student = request.student!;
    const { id } = request.params;
    const data = UpdateRouteSchema.parse(request.body);
    const existing = await prisma.userCustomRoute.findUnique({ where: { id } });
    if (!existing || existing.student_id !== student.id || existing.deleted_at) {
      return reply.code(404).send({ error: 'NOT_FOUND' });
    }
    const updated = await prisma.userCustomRoute.update({
      where: { id },
      data,
    });
    return reply.send({ route: updated });
  });

  fastify.delete<IdParams>('/routes/:id', { preHandler: protectedHeaderCheck }, async (request, reply) => {
    const student = request.student!;
    const { id } = request.params;
    const existing = await prisma.userCustomRoute.findUnique({ where: { id } });
    if (!existing || existing.student_id !== student.id || existing.deleted_at) {
      return reply.code(404).send({ error: 'NOT_FOUND' });
    }
    await prisma.userCustomRoute.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    return reply.code(204).send();
  });

  fastify.post<IdParams>('/routes/:id/share', { preHandler: protectedHeaderCheck }, async (request, reply) => {
    const student = request.student!;
    const { id } = request.params;
    const existing = await prisma.userCustomRoute.findUnique({ where: { id } });
    if (!existing || existing.student_id !== student.id || existing.deleted_at) {
      return reply.code(404).send({ error: 'NOT_FOUND' });
    }
    const token = crypto.randomBytes(16).toString('hex');
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);
    const shared = await prisma.sharedRoute.create({
      data: {
        token,
        route_id: id,
        expires_at,
      },
    });
    return reply.send({ token: shared.token, expires_at: shared.expires_at });
  });

  fastify.get<EtaParamsQuery>('/routes/:id/eta', { preHandler: protectedHeaderCheck }, async (request, reply) => {
    const student = request.student!;
    const { id } = request.params;
    const bus_id = request.query.bus_id || '00000000-0000-0000-0000-000000000002';

    const route = await prisma.userCustomRoute.findUnique({ where: { id } });
    if (!route || route.student_id !== student.id || route.deleted_at) {
      return reply.code(404).send({ error: 'NOT_FOUND' });
    }

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

    const etas = await Promise.all(
      route.stop_ids.map(async (stop_id) => {
        const cacheKey = `eta_cache:${stop_id}:${bus_id}`;
        const cached = await redis.get(cacheKey);
        if (cached) return { stop_id, data: JSON.parse(cached) as unknown };
        try {
          const response = await axios.get(`${ML_SERVICE_URL}/eta/${stop_id}?bus_id=${bus_id}`);
          await redis.set(cacheKey, JSON.stringify(response.data), 'EX', 15);
          return { stop_id, data: response.data as unknown };
        } catch {
          return { stop_id, error: 'ML_SERVICE_ERROR' as const };
        }
      })
    );
    return reply.send({ etas });
  });
}
