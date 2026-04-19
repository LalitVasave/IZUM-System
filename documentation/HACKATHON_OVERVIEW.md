# IZUM Resilient Public Transport Tracking System

## Problem Fit

IZUM is a campus transport tracking system designed for unreliable networks. It tracks live bus location, predicts ETAs, and keeps the interface useful when GPS pings become sparse or connectivity drops.

## Architecture

- Frontend: React, TypeScript, Vite, Zustand, WebSocket UI, resilient status indicators.
- Backend: Fastify, Prisma, Redis, JWT auth, telemetry ingestion, ETA proxy/fallback.
- Simulator: FastAPI service that generates GPS telemetry and simulates network modes.
- ML service: FastAPI ETA service with model-based prediction support and deterministic fallback.
- Data layer: PostgreSQL via Prisma, Redis for live telemetry and pub/sub.

## Resilience Features

### Adaptive Update Frequency

The Network Simulation page controls the simulator using `/simulator/network-mode`.

- `FULL`: 5 second GPS pings with normal payload.
- `REDUCED`: 15 second pings.
- `MINIMAL`: 30 second pings.
- `DEAD`: no telemetry is sent live; points are buffered locally.

### Sparse Update Handling

The frontend stores the last bus state and continues rendering confidence, signal state, and ETA uncertainty even when pings slow down. Signal bars and status badges communicate whether the view is live, sparse, projected, buffering, or syncing.

### Predictive Smoothing / Interpolation

The Live Map interpolates between GPS pings instead of jumping the marker. If the expected ping window is missed, it projects the marker forward from the last known heading and speed, and labels the position as projected.

### Store-and-Forward Buffering

During `DEAD` mode, the simulator continues generating GPS points but stores them in an in-memory buffer. When the mode returns to `FULL`, `REDUCED`, or `MINIMAL`, it flushes buffered points to the backend with `buffered: true`. The backend broadcasts these as `SYNCING` telemetry so the UI can show recovery.

### ETA Prediction

The ML service estimates ETA from distance, speed, traffic placeholder, and signal tier. If a trained model file is unavailable, the service falls back to a deterministic speed-distance estimate. The backend also has a local ETA fallback so the app does not fail when the ML service is offline.

## Demo Steps

1. Start Redis and Postgres.
2. Run backend:
   ```bash
   cd backend
   npm run db:setup
   npm run dev
   ```
3. Run frontend:
   ```bash
   cd frontend
   npm run dev
   ```
4. Run simulator:
   ```bash
   cd simulator
   venv\Scripts\python.exe main.py
   ```
5. Optional ML service:
   ```bash
   cd ml-service
   venv\Scripts\python.exe main.py
   ```
6. Login with `demo@campus.edu` / `Demo@1234`.
7. Open Network Simulation and switch between FULL, REDUCED, MINIMAL, and DEAD.
8. Open Live Map to see live/interpolated/projected marker behavior.
9. Watch the demo bus move through the seeded Campus Loop A stops: Library, Student Union, Science Complex, and Engineering Block. The Live Map card shows current coordinates, departed stop, next stop, and segment progress.

## Judging Criteria Mapping

- System Resilience: adaptive simulator modes, Redis pub/sub, reconnect handling, store-and-forward buffering.
- ETA Accuracy: ML-compatible ETA service plus signal-aware uncertainty and fallback prediction.
- Technical Architecture: separated frontend, backend, simulator, ML service, Redis live channel, PostgreSQL persistence.
- User Experience: signal bars, status badges, projected-position labels, BUS CLOSE banner, clear fallback states.
- Documentation: this overview plus README, deployment guide, and local runbook.

## Current Scope

This is demo-ready for the hackathon challenge. Production extensions still recommended after submission include real push notifications, real email/SMS delivery, admin dashboards, persistent simulator buffers, stricter WebSocket auth, and larger historical ETA training data.
