# Aetherium AI Analytics Platform

A demo application pairing an Angular frontend with a Python FastAPI backend to
showcase a simulated real-time AI analytics dashboard: live KPIs, accuracy trends,
model usage breakdowns, source latencies, alerts, and a top-models leaderboard.

The backend simulates a stream of `MetricsSnapshot` messages (see
[`docs/message-schema.md`](docs/message-schema.md) for the full schema, which is the
single source of truth mirrored by the frontend's TypeScript `MetricsSnapshot`
interface), and the frontend renders them live.

## Prerequisites

- Python 3.11+
- Node 18+

## Backend

From the `backend/` directory:

```bash
pip install -r backend/requirements.txt
```

Then, from `backend/`:

```bash
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**.

## Frontend

From the `frontend/` directory:

```bash
npm install
npm start
```

The app will be available at **http://localhost:4200**.
