import { FastifyInstance } from 'fastify';
import axios from 'axios';
import redis from '../utils/redis';
import db from '../utils/db';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const haversineMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const radius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

type MlEtaPayload = {
  eta_seconds?: number;
  eta_min?: number;
  eta_max?: number;
  uncertainty_bar_pct?: number;
  stops_remaining?: number;
  tier?: string;
  ts?: number;
  [key: string]: unknown;
};

const normalizeEta = (data: MlEtaPayload, stop_id: string, bus_id: string, tier = 'FULL') => {
  const etaSeconds = toNumber(data.eta_seconds, toNumber(data.eta_min, 180));
  const etaMin = toNumber(data.eta_min, etaSeconds * 0.9);
  const etaMax = toNumber(data.eta_max, etaSeconds * 1.15);
  const uncertainty = toNumber(data.uncertainty_bar_pct, 20);
  return {
    ...data,
    stop_id,
    bus_id,
    eta_seconds: etaSeconds,
    eta_min: etaMin,
    eta_max: etaMax,
    eta_minutes: Math.max(1, Math.ceil(etaSeconds / 60)),
    confidence: Math.max(0.1, Math.min(0.99, 1 - uncertainty / 100)),
    uncertainty_bar_pct: uncertainty,
    stops_remaining: Math.max(0, Math.floor(toNumber(data.stops_remaining, etaSeconds / 240))),
    tier: data.tier || tier,
    ts: data.ts || Date.now(),
  };
};

const fallbackEta = async (stop_id: string, bus_id: string) => {
  const stop = await db.stop.findUnique({ where: { id: stop_id } });
  if (!stop) {
    return normalizeEta({ eta_seconds: 300, uncertainty_bar_pct: 45, stops_remaining: 2 }, stop_id, bus_id, 'MINIMAL');
  }

  const [position, meta] = await Promise.all([
    redis.hgetall(`bus:${bus_id}:position`),
    redis.hgetall(`bus:${bus_id}:meta`),
  ]);

  const busLat = toNumber(position.lat, stop.lat);
  const busLng = toNumber(position.lng, stop.lng);
  const speedMph = Math.max(toNumber(position.speed, 12), 3);
  const speedMps = speedMph * 0.44704;
  const distance = haversineMeters(busLat, busLng, stop.lat, stop.lng);
  const tier = meta.tier || 'MINIMAL';
  const tierPenalty: Record<string, number> = {
    FULL: 0.12,
    REDUCED: 0.2,
    MINIMAL: 0.35,
    DEAD: 0.55,
  };
  const uncertaintyFactor = tierPenalty[tier] ?? 0.3;
  const etaSeconds = Math.max(60, distance / speedMps);

  return normalizeEta({
    eta_seconds: etaSeconds,
    eta_min: etaSeconds * (1 - uncertaintyFactor),
    eta_max: etaSeconds * (1 + uncertaintyFactor),
    uncertainty_bar_pct: Math.min(80, uncertaintyFactor * 100),
    stops_remaining: Math.max(0, Math.ceil(distance / 400)),
    tier,
  }, stop_id, bus_id, tier);
};

type EtaRoute = { Params: { stop_id: string }; Querystring: { bus_id?: string } };

export default async function etaRoutes(fastify: FastifyInstance) {
  fastify.get<EtaRoute>('/:stop_id', async (request, reply) => {
    const { stop_id } = request.params;
    const bus_id = request.query.bus_id || '00000000-0000-0000-0000-000000000002';

    // 1. Check Cache
    const cacheKey = `eta_cache:${stop_id}:${bus_id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      // 2. Call ML Service
      const response = await axios.get(`${ML_SERVICE_URL}/eta/${stop_id}?bus_id=${bus_id}`);
      const ml = response.data as MlEtaPayload;
      const data = normalizeEta(ml, stop_id, bus_id, typeof ml.tier === 'string' ? ml.tier : undefined);

      // 3. Cache Result (15 seconds as per docs)
      await redis.set(cacheKey, JSON.stringify(data), 'EX', 15);

      return data;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      fastify.log.warn({ err: msg }, 'ML service unavailable; using local ETA fallback');
      const data = await fallbackEta(stop_id, bus_id);
      await redis.set(cacheKey, JSON.stringify(data), 'EX', 15);
      return data;
    }
  });
}
