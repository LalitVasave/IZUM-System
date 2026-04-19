import asyncio
import math
import time
import requests
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="IZUM GPS Simulator")

CAMPUS_STOPS = [
    {"name": "Library (North Entrance)", "lat": 34.0522, "lng": -118.2437, "sequence": 1},
    {"name": "Student Union Building", "lat": 34.0530, "lng": -118.2450, "sequence": 2},
    {"name": "Science Complex", "lat": 34.0540, "lng": -118.2460, "sequence": 3},
    {"name": "Engineering Block", "lat": 34.0550, "lng": -118.2440, "sequence": 4},
]

def generate_route(stops, steps_per_segment=24):
    route = []
    for i in range(len(stops)):
        start = stops[i]
        end = stops[(i + 1) % len(stops)]
        for j in range(steps_per_segment):
            progress = j / steps_per_segment
            lat = start["lat"] + (end["lat"] - start["lat"]) * progress
            lng = start["lng"] + (end["lng"] - start["lng"]) * progress
            route.append({
                "lat": lat,
                "lng": lng,
                "from_stop": start["name"],
                "next_stop": end["name"],
                "next_sequence": end["sequence"],
                "segment_progress_pct": round(progress * 100, 1)
            })
    return route

SMOOTH_ROUTE = generate_route(CAMPUS_STOPS)
BACKEND_URL = "http://127.0.0.1:3000/api/internal/telemetry"

class NetworkModeRequest(BaseModel):
    mode: str  # FULL, REDUCED, MINIMAL, DEAD

class StartRouteRequest(BaseModel):
    lat: float
    lng: float
    name: str | None = "Current Location"

class SimulatorState:
    def __init__(self):
        self.mode = "FULL"
        self.bus_id = "00000000-0000-0000-0000-000000000002"
        self.is_running = False
        self.current_idx = 0
        self.interval = 5.0 # seconds
        self.buffered_payloads = []
        self.dropped_count = 0
        self.flushed_count = 0
        self.last_flush_ts = None
        self.last_payload = None
        self.route_name = "Campus Loop A"
        self.stops = CAMPUS_STOPS.copy()
        self.route = SMOOTH_ROUTE.copy()

state = SimulatorState()

def calculate_heading(lat1, lng1, lat2, lng2):
    dlng = lng2 - lng1
    y = math.sin(dlng) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlng)
    brng = math.atan2(y, x)
    return (math.degrees(brng) + 360) % 360

async def simulation_loop():
    while True:
        if not state.is_running:
            await asyncio.sleep(1)
            continue

        point = state.route[state.current_idx]
        lat, lng = point["lat"], point["lng"]
        next_idx = (state.current_idx + 1) % len(state.route)
        next_point = state.route[next_idx]
        next_lat, next_lng = next_point["lat"], next_point["lng"]
        
        heading = calculate_heading(math.radians(lat), math.radians(lng), math.radians(next_lat), math.radians(next_lng))
        
        payload = {
            "bus_id": state.bus_id,
            "lat": lat,
            "lng": lng,
            "heading": heading,
            "speed": 28.4,
            "tier": state.mode,
            "ts": int(time.time()),
            "route_name": state.route_name,
            "from_stop": point["from_stop"],
            "next_stop": point["next_stop"],
            "next_sequence": point["next_sequence"],
            "segment_progress_pct": point["segment_progress_pct"]
        }
        state.last_payload = payload.copy()

        if state.mode != "DEAD" and state.buffered_payloads:
            flush_batch = state.buffered_payloads[:20]
            state.buffered_payloads = state.buffered_payloads[20:]
            for buffered_payload in flush_batch:
                buffered_payload["tier"] = state.mode
                buffered_payload["buffered"] = True
                try:
                    requests.post(BACKEND_URL, json=buffered_payload, timeout=2)
                    state.flushed_count += 1
                    state.last_flush_ts = int(time.time())
                    print(f"Flushed buffered telemetry: {buffered_payload}")
                except Exception as e:
                    state.buffered_payloads.insert(0, buffered_payload)
                    print(f"Flush paused, backend unavailable: {e}")
                    break

        try:
            if state.mode == "DEAD":
                state.buffered_payloads.append(payload)
                state.dropped_count += 1
                print(f"Buffered during signal loss: {payload}")
            else:
                requests.post(BACKEND_URL, json=payload, timeout=2)
                print(f"Sent: {payload}")
        except Exception as e:
            state.buffered_payloads.append(payload)
            print(f"Failed to send telemetry: {e}")

        state.current_idx = next_idx

        # Adjust interval based on mode to simulate network constraints
        if state.mode == "FULL":
            await asyncio.sleep(5)
        elif state.mode == "REDUCED":
            await asyncio.sleep(15)
        elif state.mode == "MINIMAL":
            await asyncio.sleep(30)
        elif state.mode == "DEAD":
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    state.is_running = True
    asyncio.create_task(simulation_loop())

@app.post("/simulator/network-mode")
def set_network_mode(req: NetworkModeRequest):
    valid_modes = ["FULL", "REDUCED", "MINIMAL", "DEAD"]
    if req.mode.upper() in valid_modes:
        state.mode = req.mode.upper()
        return {"status": "success", "mode": state.mode}
    return {"status": "error", "message": "Invalid mode"}

@app.post("/simulator/start-route")
def start_route(req: StartRouteRequest):
    start_stop = {
        "name": req.name or "Current Location",
        "lat": req.lat,
        "lng": req.lng,
        "sequence": 0
    }
    state.stops = [start_stop] + CAMPUS_STOPS
    state.route = generate_route(state.stops)
    state.route_name = "Current Location to Campus Loop A"
    state.current_idx = 0
    state.buffered_payloads.clear()
    state.last_payload = None
    state.is_running = True
    return {
        "status": "success",
        "route_name": state.route_name,
        "start": start_stop,
        "next_stop": CAMPUS_STOPS[0],
        "points": len(state.route)
    }

@app.post("/simulator/reset-campus-route")
def reset_campus_route():
    state.stops = CAMPUS_STOPS.copy()
    state.route = generate_route(state.stops)
    state.route_name = "Campus Loop A"
    state.current_idx = 0
    state.buffered_payloads.clear()
    state.last_payload = None
    state.is_running = True
    return {"status": "success", "route_name": state.route_name, "points": len(state.route)}

@app.get("/simulator/status")
def get_status():
    return {
        "is_running": state.is_running,
        "mode": state.mode,
        "bus_id": state.bus_id,
        "buffered_count": len(state.buffered_payloads),
        "dropped_count": state.dropped_count,
        "flushed_count": state.flushed_count,
        "last_flush_ts": state.last_flush_ts,
        "route_name": state.route_name,
        "stops": state.stops,
        "current": state.last_payload
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
