# Aetherium AI Analytics Platform — Design Spec

**Date:** 2026-08-04
**Status:** Approved

## Summary

A demo web application with two parts:

1. A **showcase landing card** (the "Aetherium AI Analytics Platform" card) whose "Learn More"
   action opens the working dashboard.
2. A **working real-time analytics dashboard** driven by **simulated (mocked) data** streamed
   over WebSockets.

Data is entirely simulated — no real ML models or external data sources. The goal is to reproduce
the look and live feel of the screenshot with production-quality, well-structured code.

## Scope

In scope:

- Showcase card component (title, description, "Processing 4.2M events/sec", tech-stack chips, Learn More).
- Dashboard with all widgets from the screenshot.
- Live WebSocket data stream (simulated).
- Mock login / auth with a protected dashboard route.
- Customizable widgets (add / remove / rearrange, persisted to localStorage).
- Dark / light theme toggle (dark is default, matching the screenshot).

Out of scope:

- Real machine-learning models or predictions.
- Real external data sources or databases.
- Real user accounts, password security, or multi-user persistence (auth is mocked).

## Tech Stack

| Layer            | Technology                                   |
|------------------|----------------------------------------------|
| Frontend         | Angular + TypeScript                          |
| Styling          | Tailwind CSS (dark mode via `dark:` classes)  |
| Charts           | ngx-charts                                     |
| Drag & drop      | Angular CDK (DragDrop)                          |
| Transport        | WebSockets (RxJS on the client)                |
| Backend          | Python + FastAPI (uvicorn)                      |
| Tooling          | Node.js (Angular CLI toolchain)                |

## Architecture

```
Angular App (TypeScript + Tailwind)
  Landing + ProjectCard  --Learn More-->  Dashboard (protected route)
                                              |  WebSocket client
                                              v
Python FastAPI backend
  - WebSocket /stream : pushes MetricsSnapshot JSON on each tick
  - simulator         : random-walk metric generator (~1-2s tick)
  - POST /auth/login  : returns a mock token (any credentials accepted)
```

Monorepo layout:

```
/frontend   Angular app (served by Angular CLI / Node)
/backend    Python FastAPI app
/docs       specs and plans
README.md   run instructions for both apps
```

## Frontend Components

- **LandingComponent** — hosts ProjectCardComponent.
- **ProjectCardComponent** — the showcase card from the screenshot; Learn More routes to `/dashboard`.
- **LoginComponent** — mock auth form; stores fake token; `AuthGuard` protects `/dashboard`.
- **DashboardComponent** — hosts the WidgetGridComponent.
- **WidgetGridComponent** — customizable layer: add / remove / drag widgets (Angular CDK),
  layout persisted to localStorage.
- **Widgets** (each small, independent, subscribes to typed observables):
  - `KpiTileComponent` ×4 — Total Predictions, Model Accuracy, Data Points, Active Models.
  - `AccuracyTrendChartComponent` — area/line trend (ngx-charts).
  - `ModelUsageDonutComponent` — donut of model usage % (ngx-charts).
  - `DataSourceLatencyBarsComponent` — bar chart of source latencies (ngx-charts).
  - `RecentAlertsTableComponent` — rolling alerts (Critical / Warning / Info).
  - `TopPerformingModelsComponent` — ranked model list with deltas.
- **Services:**
  - `MetricsSocketService` — single WebSocket connection; exposes typed RxJS observables;
    auto-reconnect with backoff on disconnect.
  - `ThemeService` — dark/light toggle, persisted to localStorage.
  - `AuthService` + `AuthGuard` — mock token storage and route protection.
  - `WidgetLayoutService` — persists the customizable grid layout to localStorage.

## Backend Components

- `main.py` — FastAPI app, CORS, route registration.
- `simulator.py` — builds a `MetricsSnapshot` each tick via seeded random-walk so values drift
  realistically (KPIs, accuracy time series, model usage %, source latencies, rolling alerts).
- `websocket.py` — `/stream` endpoint; broadcasts JSON snapshots to all connected clients.
- `auth.py` — `POST /auth/login`; returns a mock token (any credentials accepted).

## Shared Message Schema

Backend payloads and frontend TypeScript interfaces mirror each other. Single `MetricsSnapshot`
message shape (documented in the plan) containing: kpis, accuracyTrend[], modelUsage[],
sourceLatencies[], recentAlerts[], topModels[], and a server timestamp.

## Data Flow

Simulator ticks (~1-2s) → assembles `MetricsSnapshot` JSON → WebSocket `/stream` broadcast →
`MetricsSocketService` parses into typed observables → widgets re-render with animated transitions.
On disconnect the client auto-reconnects with exponential backoff.

## Testing

- **Frontend** (Jasmine/Karma or Jest): `ThemeService`, `MetricsSocketService` (mocked socket),
  `WidgetLayoutService`, and representative widget components.
- **Backend** (pytest): simulator output ranges/shape; a WebSocket smoke test.

## Tooling & Repo

- `README.md` with run instructions: Angular dev server (frontend) + `uvicorn` (backend),
  plus a convenience script to run both.
- `.gitignore` for Node and Python.
- Initialize git (`git init`) — the working folder is not currently a repo.
