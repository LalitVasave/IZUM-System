import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import redis from '../utils/redis';

const TelemetrySchema = z.object({
  bus_id: z.string(),
  lat: z.number(),
  lng: z.number(),
  heading: z.number(),
  speed: z.number(),
  tier: z.string(),
  ts: z.number(),
  buffered: z.boolean().optional(),
  route_name: z.string().optional(),
  from_stop: z.string().optional(),
  next_stop: z.string().optional(),
  next_sequence: z.number().optional(),
  segment_progress_pct: z.number().optional()
});

export default async function telemetryRoutes(fastify: FastifyInstance) {
  fastify.post('/telemetry', async (request, reply) => {
    const data = TelemetrySchema.parse(request.body);
    const bus_id = data.bus_id;

    // Determine state and confidence based on tier and TTLs
    let state = "ACTIVE";
    let confidence = 5;
    let ttl = 120; // default 120s

    if (data.buffered) {
      state = "SYNCING";
      confidence = 25;
      ttl = 120;
    } else if (data.tier === "FULL") {
      state = "ACTIVE";
      confidence = 5;
      ttl = 120;
    } else if (data.tier === "REDUCED") {
      state = "SPARSE";
      confidence = 15;
      ttl = 120;
    } else if (data.tier === "MINIMAL") {
      state = "LOST";
      confidence = 45;
      ttl = 120;
    } else if (data.tier === "DEAD") {
      state = "BUFFERING";
      confidence = 100;
      ttl = 120;
    }

    // Write Pipeline
    const pipeline = redis.pipeline();
    
    // bus:{id}:state
    pipeline.hset(`bus:${bus_id}:state`, { state, last_updated: data.ts });
    pipeline.expire(`bus:${bus_id}:state`, 120);

    // bus:{id}:position
    pipeline.hset(`bus:${bus_id}:position`, {
      lat: data.lat,
      lng: data.lng,
      heading: data.heading,
      speed: data.speed,
      ts: data.ts
    });
    pipeline.expire(`bus:${bus_id}:position`, 120);

    // bus:{id}:meta
    pipeline.hset(`bus:${bus_id}:meta`, {
      tier: data.tier,
      confidence_radius_m: confidence,
      last_ping_ts: data.ts
    });
    pipeline.expire(`bus:${bus_id}:meta`, 300);

    await pipeline.exec();

    // Broadcast over WS
    const broadcastPayload = {
      bus_id,
      state,
      lat: data.lat,
      lng: data.lng,
      heading: data.heading,
      speed: data.speed,
      tier: data.tier,
      buffered: Boolean(data.buffered),
      route_name: data.route_name,
      from_stop: data.from_stop,
      next_stop: data.next_stop,
      next_sequence: data.next_sequence,
      segment_progress_pct: data.segment_progress_pct,
      confidence_radius_m: confidence,
      ts: data.ts
    };

    await redis.publish(`channel:bus:${bus_id}`, JSON.stringify(broadcastPayload));

    return reply.send({ success: true });
  });
}
