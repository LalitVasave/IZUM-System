import { FastifyInstance } from 'fastify';
import db from '../utils/db';

export default async function stopRoutes(fastify: FastifyInstance) {
  // GET /api/stops — list all stops ordered by sequence
  fastify.get('/', async (request, reply) => {
    try {
      const stops = await db.stop.findMany({
        orderBy: { sequence: 'asc' }
      });
      return stops;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "DB_ERROR", message: "Failed to fetch stops" });
    }
  });

  // GET /api/stops/:id — get a single stop by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;
    try {
      const stop = await db.stop.findUnique({ where: { id } });
      if (!stop) return reply.code(404).send({ error: "NOT_FOUND", message: "Stop not found" });
      return stop;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "DB_ERROR", message: "Failed to fetch stop" });
    }
  });
}
