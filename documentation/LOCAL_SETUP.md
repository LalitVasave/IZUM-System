# IZUM Platform - Local Runbook

This document contains all the terminal commands required to run the IZUM Campus Mobility Platform locally on your machine. You can use the helper scripts from the project root on Windows, or run the four services manually in separate terminals.

## Quick Start on Windows

From the project root:

```bat
start-izum.bat
```

To confirm the ports are up:

```bat
check-izum.bat
```

To stop the stack later:

```bat
stop-izum.bat
```

### Prerequisites
Make sure you have running instances of PostgreSQL and Redis locally.
- **Postgres** (Default port: 5432)
- **Redis** (Default port: 6379)

---

## Terminal 1: The Backend (Fastify Node.js)

This terminal will run the core API and WebSocket server.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Setup the database (creates tables based on Prisma schema)
npx prisma db push

# 4. Seed the database (creates test routes, stops, and buses)
npm run prisma:seed

# 5. Start the backend server in development mode
npm run dev
```
*(The backend should now be running on `http://localhost:3000`)*

---

## Terminal 2: The Frontend (React/Vite)

This terminal will run the user interface.

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```
*(The frontend should now be running on `http://localhost:5173`)*

---

## Terminal 3: The GPS Simulator (Python)

This terminal runs the script that mocks a bus driving around campus and sends coordinates to the backend via Redis.

```bash
# 1. Navigate to the simulator directory
cd simulator

# 2. Create a Python virtual environment (recommended)
python -m venv venv

# 3. Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the simulator
python main.py
```
*(You will see console logs as the simulator broadcasts telemetry coordinates)*

---

## Terminal 4: The ML Anomaly Service (Python)

This terminal runs the AI engine that detects "Ghost Buses" and anomalies.

```bash
# 1. Navigate to the ML service directory
cd ml-service

# 2. Create a Python virtual environment (recommended)
python -m venv venv

# 3. Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the anomaly detection service
python main.py
```
*(The ML service will quietly listen for telemetry data and flag anomalies)*

---

## Testing the Full Flow

Once all four terminals are running:
1. Open your browser to `http://localhost:5173`.
2. Register a new account or log in.
3. Navigate to the **Live Map**.
4. You should see the bus marker dynamically moving across the screen based on the data fed from the Simulator terminal.
5. In the simulator, if you trigger a deviation, the ML Service terminal will detect it, and the Frontend will immediately display a high-priority "Ghost Bus" alert.
