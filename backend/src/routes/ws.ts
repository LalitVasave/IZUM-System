import { FastifyInstance } from 'fastify';
import { verifyToken } from '../utils/jwt';
import Redis from 'ioredis';

// Need a separate redis client for subscribing, as a subscribed client cannot issue other commands
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export default async function wsRoutes(fastify: FastifyInstance) {
  fastify.get('/bus/:bus_id', { websocket: true }, async (socket, request) => {
    // Authenticate (in production, extract token from sec-websocket-protocol or query)
    // For simplicity, we accept a query param ?token=...
    const token = (request.query as any).token;
    if (!token) {
      socket.close(1008, "Token Required");
      return;
    }

    try {
      await verifyToken(token);
    } catch (err) {
      socket.close(1008, "Invalid Token");
      return;
    }

    const { bus_id } = request.params as any;
    
    // Create dedicated subscriber for this WS connection
    const subscriber = new Redis(redisUrl);
    const channel = `channel:bus:${bus_id}`;

    subscriber.subscribe(channel, (err) => {
      if (err) {
        console.error("Failed to subscribe", err);
        socket.close(1011, "Internal Error");
      }
    });

    subscriber.on('message', (chan, message) => {
      if (chan === channel) {
        socket.send(message);
      }
    });

    socket.on('close', () => {
      subscriber.unsubscribe(channel);
      subscriber.quit();
    });
  });
}
