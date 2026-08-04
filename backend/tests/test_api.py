from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_login_returns_token():
    r = client.post("/auth/login", json={"username": "demo", "password": "x"})
    assert r.status_code == 200
    assert isinstance(r.json()["token"], str)
    assert len(r.json()["token"]) > 0


def test_stream_sends_snapshot():
    with client.websocket_connect("/stream") as ws:
        data = ws.receive_json()
        assert "kpis" in data
        assert "modelAccuracy" in data["kpis"]
