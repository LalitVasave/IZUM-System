import { FastifyInstance } from 'fastify';
import db from '../utils/db';
import { z } from 'zod';

const CheckinSchema = z.object({
  bus_id: z.string().optional(),
  late_night: z.boolean().default(false),
});

export default async function driverRoutes(fastify: FastifyInstance) {
  fastify.post('/checkin', async (request, reply) => {
    // Authenticate (get driver_id from JWT)
    const driver_id = "06420000-0000-0000-0000-000000000000"; // Dummy driver UUID

    try {
      const data = CheckinSchema.parse(request.body);
      
      const checkin = await db.driverCheckin.create({
        data: {
          driver_id,
          bus_id: "677f5a54-406a-4d24-8186-0a2b84920478", // Specific ID for bus_01 mock
          late_night_mode: data.late_night
        }
      });

      return { success: true, checkin_id: checkin.id };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(400).send({ error: "CHECKIN_FAILED" });
    }
  });
}
