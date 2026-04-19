# IZUM Campus Mobility Platform

IZUM is a next-generation protocol for kinetic observability and campus mobility. It provides real-time bus tracking, ETA predictions, anomaly detection (Ghost Bus), and a robust safety hub including Silent SOS and Virtual Escorts.

## 🚀 Features

- **Sequential Role-based Navigation:** Distinct workflows for Students and Drivers.
- **Kinetic Observatory:** Real-time bus telemetry tracking on an interactive map.
- **Safety Hub:** Silent SOS signaling and Virtual Escort tracking links.
- **Anomaly Detection:** Machine Learning model detects Ghost Bus scenarios and warns passengers.
- **Ultra-low Payload:** Telemetry optimizations for zero-latency sync.
- **JWT Authentication:** Secure user management with auto-refreshing sessions.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion, Zustand, Leaflet
- **Backend:** Node.js, Fastify, Prisma ORM, Redis, JWT
- **Machine Learning:** Python, Scikit-Learn
- **Simulator:** Python-based live GPS telemetry generator

---

## 💻 Local Development Setup

### Quick Start on Windows
```bat
start-izum.bat
```

To check whether all four services are up:

```bat
check-izum.bat
```

To stop the stack:
```bat
stop-izum.bat
```

### 1. Backend Setup
```bash
cd backend
npm install
npm run db:setup
```
*Note: Make sure Redis is running locally on port 6379, or provide a `REDIS_URL` in your `.env`.*

```bash
npm run dev
```
*(Runs on port 3000)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Runs on port 5173 and proxies `/api` to the backend)*

### 3. ML Service (Optional, for ETA and Anomaly Detection)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
*(Runs on port 8001)*

### 4. Simulator (Optional, to generate live bus movements)
```bash
cd simulator
pip install -r requirements.txt
python main.py
```
*(Runs on port 8000)*

---

## 🌍 Deployment Guide

### Deploying the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and create a new project from your GitHub repo.
2. Under **Framework Preset**, choose `Vite`.
3. Under **Root Directory**, click Edit and select `frontend`.
4. Click **Deploy**.
*Note: The `vercel.json` file is already included to handle SPA routing and API proxy rewrites.*

### Deploying the Backend (Railway)
1. Go to [Railway](https://railway.app/) and create a new project.
2. Add a **Redis** plugin from the dashboard.
3. Deploy from GitHub repo.
4. Under the service settings, change the **Root Directory** to `/backend`.
5. Add the following Environment Variables:
   - `DATABASE_URL` (You can use Railway's Postgres plugin or an external DB like Supabase)
   - `REDIS_URL` (Matches the Redis plugin internal URL)
   - `JWT_SECRET` (Generate a random secure string)
6. Under **Build Command**, use: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
7. Under **Start Command**, use: `npm start`
8. Generate a public domain. **Important**: Update the `destination` URL in `frontend/vercel.json` to point to this new Railway domain.

---
© 2024 IZUM Kinetic Observatory
