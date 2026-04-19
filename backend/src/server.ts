import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import path from 'path';
import fastifyWebsocket from '@fastify/websocket';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import authRoutes from './routes/auth';
import telemetryRoutes from './routes/telemetry';
import wsRoutes from './routes/ws';
import etaRoutes from './routes/eta';
import stopRoutes from './routes/stops';
import sosRoutes from './routes/sos';
import driverRoutes from './routes/driver';
import userRoutes from './routes/userRoutes';
import prisma from './utils/db';

const fastify = Fastify({ logger: true });

// Register Plugins
fastify.register(fastifyCookie);
fastify.register(fastifyWebsocket);
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
fastify.register(fastifyCors, {
  origin: allowedOrigin,
  credentials: true
});
fastify.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"]
    }
  }
});
fastify.register(fastifyRateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (request, context) => ({
    statusCode: 429,
    error: 'TOO_MANY_REQUESTS',
    message: `Rate limit exceeded. Try again in ${context.after}.`
  })
});

// Static serving removed for React frontend

// Register API Routes
fastify.get('/health', async (request, reply) => {
  return reply.send({ status: 'ok', time: new Date().toISOString() });
});

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(telemetryRoutes, { prefix: '/api/internal' });
fastify.register(wsRoutes, { prefix: '/ws' });
fastify.register(etaRoutes, { prefix: '/api/eta' });
fastify.register(stopRoutes, { prefix: '/api/stops' });
fastify.register(sosRoutes, { prefix: '/api/sos' });
fastify.register(driverRoutes, { prefix: '/api/driver' });
fastify.register(userRoutes, { prefix: '/api/user' });

// Start Server
const start = async () => {
  try {
    fastify.log.info('Attempting to connect to PostgreSQL via Prisma...');
    // Add a 10-second timeout to the Prisma connection
    const connectPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Prisma connection timeout after 10s')), 10000)
    );
    await Promise.race([connectPromise, timeoutPromise]);
    fastify.log.info('Successfully connected to PostgreSQL');
  } catch (err) {
    fastify.log.error(
      { err },
      'CRITICAL: PostgreSQL connection failed. Check DATABASE_URL in backend/.env'
    );
    process.exit(1);
  }

  try {
    fastify.log.info('Starting Fastify server on port 3000...');
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('\n🚀 IZUM Backend is live at http://localhost:3000');
    console.log('📡 Health check: http://localhost:3000/health\n');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
