import { FastifyInstance } from 'fastify';
import db from '../utils/db';
import { verifyToken } from '../utils/jwt';
import { z } from 'zod';
import crypto from 'crypto';

const SOSSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  bus_id: z.string().optional(),
});

export default async function sosRoutes(fastify: FastifyInstance) {
  // POST /api/sos — trigger a silent SOS alert
  fastify.post('/', async (request, reply) => {
    // Extract student identity from JWT
    let student_id_hash = 'anonymous';
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token);
        const userId = payload.id as string;
        student_id_hash = crypto.createHash('sha256').update(userId).digest('hex');
      } catch (err) {
        // Use anonymous hash if token fails — SOS should still go through
        fastify.log.warn('SOS: Could not verify JWT, using anonymous hash');
      }
    }

    try {
      const data = SOSSchema.parse(request.body);

      const event = await db.sosEvent.create({
        data: {
          student_id_hash,
          bus_id: data.bus_id || null,
          lat: data.lat,
          lng: data.lng,
          status: 'PENDING'
        }
      });

      // Automatic Incident Logging
      await db.incidentLog.create({
        data: {
          type: 'SOS',
          severity: 'CRITICAL',
          description: `Silent SOS triggered by user ${student_id_hash.substring(0, 8)} near ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
          lat: data.lat,
          lng: data.lng,
          student_hash: student_id_hash
        }
      });

      fastify.log.warn(`🚨 SOS ALERT: ${event.id} at ${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`);

      // In production: trigger Resend/Twilio/Push here
      return reply.code(201).send({ success: true, event_id: event.id });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(400).send({ error: "SOS_FAILED", message: "Could not create SOS event" });
    }
  });

  // GET /api/sos/status — check recent SOS events (admin use)
  fastify.get('/status', async (request, reply) => {
    try {
      const events = await db.sosEvent.findMany({
        orderBy: { ts: 'desc' },
        take: 20,
      });
      return events;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "DB_ERROR" });
    }
  });
}
