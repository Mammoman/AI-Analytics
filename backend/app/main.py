import asyncio
import uuid

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.simulator import MetricsSimulator

TICK_SECONDS = 1.5

app = FastAPI(title="Aetherium AI Analytics Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/login")
def login(credentials: dict):
    # Mock auth: any credentials accepted.
    return {"token": uuid.uuid4().hex}


@app.websocket("/stream")
async def stream(websocket: WebSocket):
    await websocket.accept()
    sim = MetricsSimulator()
    try:
        while True:
            await websocket.send_json(sim.tick().to_dict())
            await asyncio.sleep(TICK_SECONDS)
    except WebSocketDisconnect:
        return
