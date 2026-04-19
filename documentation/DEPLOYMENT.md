# IZUM Mobility Platform - Deployment Guide

This guide covers the necessary steps to deploy the IZUM Campus Mobility Platform to production. We will use **Railway** for the Node.js backend & PostgreSQL database, and **Vercel** for the React frontend.

## 1. Backend Deployment (Railway)

We recommend deploying the backend first, as the frontend will need the backend's production URL.

1. **Sign up / Log in** to [Railway.app](https://railway.app/).
2. Create a new project and select **Deploy from GitHub repo**.
3. Select your `izumfinal` repository.
4. **Important**: Since the backend is in a subdirectory, go to your service settings in Railway -> **Build** -> **Root Directory** and set it to `/backend`.
5. Railway will automatically detect the `package.json` and `railway.toml` inside the `backend` folder.
6. **Add PostgreSQL & Redis**:
   - In your Railway project, click **New** -> **Database** -> **Add PostgreSQL**.
   - Click **New** -> **Database** -> **Add Redis**.
7. **Environment Variables**:
   - Go to your backend service -> **Variables**.
   - Railway will automatically provide `DATABASE_URL` (for Postgres) and `REDIS_URL` (for Redis).
   - Add a custom `JWT_SECRET` (generate a random secure string).
8. **Deploy**:
   - Click Deploy. The `postinstall` script (`prisma generate`) and `build` script (`tsc`) will run automatically.
   - Once deployed, go to the **Settings** -> **Networking** and generate a public domain (e.g., `izum-backend-production.up.railway.app`).

## 2. Frontend Deployment (Vercel)

1. **Sign up / Log in** to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your `izumfinal` repository from GitHub.
4. **Important Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - Vercel automatically proxies requests to your backend via `vercel.json` rewrites. 
   - *Ensure the destination URL in `frontend/vercel.json` exactly matches your newly generated Railway backend URL.*
6. **Deploy**:
   - Click Deploy. Vercel will build the React app and deploy it to a global edge network.

## 3. ML Service & Simulator (Optional)

The `ml-service` (Anomaly Detection) and `simulator` (Python mock bus GPS generator) are typically run as separate containerized services or chron jobs. 
- You can deploy the `ml-service` to Railway as another service, pointing its root directory to `/ml-service` and using the provided `Dockerfile`.
- The `simulator` is only needed if you do not have physical IoT hardware sending GPS coordinates yet. You can run it locally and point it to the production Redis instance, or deploy it as a worker script on Railway.

---

### Troubleshooting

- **CORS Issues**: Ensure that the Fastify backend allows requests from your Vercel production domain.
- **WebSocket Drops**: Railway supports WebSockets natively. If connections drop, the frontend `WebSocketContext` is designed to auto-reconnect.
- **Prisma Errors**: If you get a "Prisma Client not found" error, verify that the `postinstall` script successfully ran `prisma generate` in the Railway build logs.
