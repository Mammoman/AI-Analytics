# Aetherium AI Analytics Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a showcase landing card plus a working, real-time (simulated-data) AI analytics dashboard matching the reference screenshot.

**Architecture:** Angular + Tailwind frontend consumes a `MetricsSnapshot` stream over WebSockets from a Python FastAPI backend whose simulator emits random-walk metrics on a timer. Mock auth guards the dashboard route; the customizable widget grid and theme persist to localStorage.

**Tech Stack:** Angular, TypeScript, Tailwind CSS, ngx-charts, Angular CDK (DragDrop), RxJS, Python, FastAPI, uvicorn, pytest.

## Global Constraints

- Monorepo layout: `frontend/` (Angular) and `backend/` (Python FastAPI); specs/plans under `docs/`.
- Data is fully simulated — no real ML, databases, or external sources.
- Auth is mocked — any credentials accepted; token stored client-side only.
- Dark mode is the default theme (matches screenshot); light mode is a toggle.
- Frontend and backend `MetricsSnapshot` shapes must stay identical.
- Charts use ngx-charts; drag-and-drop uses Angular CDK.
- Product name in UI copy is exactly "Aetherium AI Analytics Platform".
- Backend WebSocket path is `/stream`; login path is `POST /auth/login`.
- Simulator tick interval: 1.5 seconds.
- Frontend dev server: `http://localhost:4200`; backend: `http://localhost:8000`.

---

### Task 1: Repo scaffold, backend project, and shared schema doc

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `backend/requirements.txt`
- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/schema.py`
- Create: `docs/message-schema.md`
- Test: `backend/tests/test_schema.py`

**Interfaces:**
- Produces: `MetricsSnapshot`, `Kpis`, `TrendPoint`, `ModelUsage`, `SourceLatency`, `Alert`, `TopModel` dataclasses in `backend/app/schema.py`; `MetricsSnapshot.to_dict() -> dict`.

- [ ] **Step 1: Initialize git and create `.gitignore`**

```bash
cd "C:/Users/User/Documents/AI Analytics"
git init
```

`.gitignore`:
```
# Python
__pycache__/
*.pyc
.venv/
venv/
.pytest_cache/
# Node / Angular
node_modules/
frontend/dist/
frontend/.angular/
# Editor / OS
.DS_Store
Thumbs.db
.vscode/
```

- [ ] **Step 2: Create backend dependency files**

`backend/requirements.txt`:
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
pytest==8.3.3
httpx==0.27.2
```

`backend/pyproject.toml`:
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
```

`backend/app/__init__.py`: (empty file)

- [ ] **Step 3: Write the failing schema test**

`backend/tests/test_schema.py`:
```python
from app.schema import (
    Kpis, TrendPoint, ModelUsage, SourceLatency, Alert, TopModel, MetricsSnapshot,
)


def test_snapshot_to_dict_has_all_sections():
    snap = MetricsSnapshot(
        timestamp="2026-08-04T00:00:00Z",
        kpis=Kpis(total_predictions=8_900_000, model_accuracy=96.7,
                  data_points=512_000_000_000, active_models=42),
        accuracy_trend=[TrendPoint(t="00:00", actual=95.0, predicted=95.5)],
        model_usage=[ModelUsage(name="Model A", percent=28.0)],
        source_latencies=[SourceLatency(name="Mon", ms=12)],
        recent_alerts=[Alert(level="Critical", message="Node down", source="ALSA-4", value="Critical")],
        top_models=[TopModel(name="Model A", score=98.6, delta=0.6)],
    )
    d = snap.to_dict()
    assert set(d.keys()) == {
        "timestamp", "kpis", "accuracyTrend", "modelUsage",
        "sourceLatencies", "recentAlerts", "topModels",
    }
    assert d["kpis"]["modelAccuracy"] == 96.7
    assert d["accuracyTrend"][0]["predicted"] == 95.5
    assert d["recentAlerts"][0]["level"] == "Critical"
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `cd backend && python -m pytest tests/test_schema.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.schema'`

- [ ] **Step 5: Implement the schema**

`backend/app/schema.py`:
```python
from dataclasses import dataclass, field
from typing import List


@dataclass
class Kpis:
    total_predictions: int
    model_accuracy: float
    data_points: int
    active_models: int

    def to_dict(self) -> dict:
        return {
            "totalPredictions": self.total_predictions,
            "modelAccuracy": self.model_accuracy,
            "dataPoints": self.data_points,
            "activeModels": self.active_models,
        }


@dataclass
class TrendPoint:
    t: str
    actual: float
    predicted: float

    def to_dict(self) -> dict:
        return {"t": self.t, "actual": self.actual, "predicted": self.predicted}


@dataclass
class ModelUsage:
    name: str
    percent: float

    def to_dict(self) -> dict:
        return {"name": self.name, "percent": self.percent}


@dataclass
class SourceLatency:
    name: str
    ms: int

    def to_dict(self) -> dict:
        return {"name": self.name, "ms": self.ms}


@dataclass
class Alert:
    level: str  # "Critical" | "Warning" | "Info"
    message: str
    source: str
    value: str

    def to_dict(self) -> dict:
        return {
            "level": self.level,
            "message": self.message,
            "source": self.source,
            "value": self.value,
        }


@dataclass
class TopModel:
    name: str
    score: float
    delta: float

    def to_dict(self) -> dict:
        return {"name": self.name, "score": self.score, "delta": self.delta}


@dataclass
class MetricsSnapshot:
    timestamp: str
    kpis: Kpis
    accuracy_trend: List[TrendPoint] = field(default_factory=list)
    model_usage: List[ModelUsage] = field(default_factory=list)
    source_latencies: List[SourceLatency] = field(default_factory=list)
    recent_alerts: List[Alert] = field(default_factory=list)
    top_models: List[TopModel] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "kpis": self.kpis.to_dict(),
            "accuracyTrend": [p.to_dict() for p in self.accuracy_trend],
            "modelUsage": [m.to_dict() for m in self.model_usage],
            "sourceLatencies": [s.to_dict() for s in self.source_latencies],
            "recentAlerts": [a.to_dict() for a in self.recent_alerts],
            "topModels": [t.to_dict() for t in self.top_models],
        }
```

- [ ] **Step 6: Document the schema**

`docs/message-schema.md`: document each field of the JSON above (camelCase keys, types, units), noting this is the single source of truth mirrored by the frontend `MetricsSnapshot` TypeScript interface.

- [ ] **Step 7: Write `README.md`**

Include: project summary, prerequisites (Python 3.11+, Node 18+), backend run (`pip install -r backend/requirements.txt`, `uvicorn app.main:app --reload` from `backend/`), frontend run (`npm install`, `npm start` from `frontend/`), and the two URLs.

- [ ] **Step 8: Run the test to verify it passes**

Run: `cd backend && python -m pytest tests/test_schema.py -v`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add .gitignore README.md backend docs
git commit -m "chore: scaffold repo, backend project, and metrics schema"
```

---

### Task 2: Metrics simulator (random-walk generator)

**Files:**
- Create: `backend/app/simulator.py`
- Test: `backend/tests/test_simulator.py`

**Interfaces:**
- Consumes: `MetricsSnapshot` and member dataclasses from `app.schema`.
- Produces: `class MetricsSimulator` with `__init__(self, seed: int = 42)` and `tick(self) -> MetricsSnapshot`. Each `tick()` advances internal state by one step and returns a fresh snapshot.

- [ ] **Step 1: Write the failing test**

`backend/tests/test_simulator.py`:
```python
from app.simulator import MetricsSimulator


def test_tick_returns_bounded_accuracy():
    sim = MetricsSimulator(seed=1)
    for _ in range(200):
        snap = sim.tick()
        assert 80.0 <= snap.kpis.model_accuracy <= 100.0


def test_tick_shapes_are_stable():
    sim = MetricsSimulator(seed=1)
    snap = sim.tick()
    assert len(snap.model_usage) == 4
    assert abs(sum(m.percent for m in snap.model_usage) - 100.0) < 0.01
    assert len(snap.source_latencies) == 7
    assert len(snap.top_models) >= 3
    assert len(snap.accuracy_trend) == 24


def test_seed_is_deterministic():
    a = MetricsSimulator(seed=7).tick().to_dict()
    b = MetricsSimulator(seed=7).tick().to_dict()
    assert a == b
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd backend && python -m pytest tests/test_simulator.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.simulator'`

- [ ] **Step 3: Implement the simulator**

`backend/app/simulator.py`:
```python
import random
from datetime import datetime, timezone

from app.schema import (
    Kpis, TrendPoint, ModelUsage, SourceLatency, Alert, TopModel, MetricsSnapshot,
)

MODEL_NAMES = ["Model A", "Model B", "Model C", "Model D"]
SOURCE_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
ALERT_LEVELS = ["Critical", "Warning", "Info"]
ALERT_MESSAGES = [
    "Node latency spike", "Model drift detected", "Ingest backlog",
    "Accuracy dip", "Cache miss surge", "Replica rebalanced",
]


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


class MetricsSimulator:
    def __init__(self, seed: int = 42):
        self._rng = random.Random(seed)
        self._accuracy = 96.7
        self._total_predictions = 8_900_000
        self._data_points = 512_000_000_000
        self._active_models = 42
        self._usage = [28.0, 25.0, 25.0, 22.0]
        self._trend = [self._accuracy for _ in range(24)]

    def _step_usage(self) -> list:
        deltas = [self._rng.uniform(-1.0, 1.0) for _ in self._usage]
        raw = [_clamp(u + d, 5.0, 60.0) for u, d in zip(self._usage, deltas)]
        total = sum(raw)
        self._usage = [round(r / total * 100.0, 1) for r in raw]
        return self._usage

    def tick(self) -> MetricsSnapshot:
        self._accuracy = round(_clamp(self._accuracy + self._rng.uniform(-0.4, 0.4), 90.0, 99.9), 1)
        self._total_predictions += self._rng.randint(1_000, 20_000)
        self._data_points += self._rng.randint(1_000_000, 50_000_000)
        self._active_models = int(_clamp(self._active_models + self._rng.randint(-1, 1), 30, 60))

        self._trend = self._trend[1:] + [self._accuracy]
        trend = [
            TrendPoint(t=f"{i:02d}:00",
                       actual=round(v, 1),
                       predicted=round(_clamp(v + self._rng.uniform(-0.6, 0.6), 90.0, 99.9), 1))
            for i, v in enumerate(self._trend)
        ]

        usage = [ModelUsage(name=n, percent=p) for n, p in zip(MODEL_NAMES, self._step_usage())]
        latencies = [SourceLatency(name=n, ms=self._rng.randint(8, 60)) for n in SOURCE_NAMES]

        alerts = []
        for _ in range(4):
            level = self._rng.choices(ALERT_LEVELS, weights=[1, 3, 6])[0]
            alerts.append(Alert(
                level=level,
                message=self._rng.choice(ALERT_MESSAGES),
                source=f"ALSA-{self._rng.randint(1, 9)}",
                value=level,
            ))

        top = sorted(
            [TopModel(name=n, score=round(self._rng.uniform(90.0, 99.9), 1),
                      delta=round(self._rng.uniform(-1.0, 1.0), 1))
             for n in MODEL_NAMES],
            key=lambda m: m.score, reverse=True,
        )

        return MetricsSnapshot(
            timestamp=datetime.now(timezone.utc).isoformat(),
            kpis=Kpis(
                total_predictions=self._total_predictions,
                model_accuracy=self._accuracy,
                data_points=self._data_points,
                active_models=self._active_models,
            ),
            accuracy_trend=trend,
            model_usage=usage,
            source_latencies=latencies,
            recent_alerts=alerts,
            top_models=top,
        )
```

Note: `test_seed_is_deterministic` compares `to_dict()`; the `timestamp` field uses wall clock and would differ. Fix the test to drop timestamp before comparing:
```python
def test_seed_is_deterministic():
    a = MetricsSimulator(seed=7).tick().to_dict()
    b = MetricsSimulator(seed=7).tick().to_dict()
    a.pop("timestamp"); b.pop("timestamp")
    assert a == b
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_simulator.py -v`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/app/simulator.py backend/tests/test_simulator.py
git commit -m "feat: add random-walk metrics simulator"
```

---

### Task 3: FastAPI app — WebSocket `/stream` and mock `/auth/login`

**Files:**
- Create: `backend/app/main.py`
- Test: `backend/tests/test_api.py`

**Interfaces:**
- Consumes: `MetricsSimulator` from `app.simulator`.
- Produces: FastAPI `app`; `POST /auth/login` returning `{"token": str}`; `GET /health` returning `{"status": "ok"}`; `WS /stream` broadcasting `MetricsSnapshot.to_dict()` JSON every 1.5s.

- [ ] **Step 1: Write the failing test**

`backend/tests/test_api.py`:
```python
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd backend && python -m pytest tests/test_api.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.main'`

- [ ] **Step 3: Implement the app**

`backend/app/main.py`:
```python
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_api.py -v`
Expected: PASS (3 tests)

- [ ] **Step 5: Manual smoke check**

Run: `cd backend && uvicorn app.main:app --reload`
Visit `http://localhost:8000/health` → `{"status":"ok"}`. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add backend/app/main.py backend/tests/test_api.py
git commit -m "feat: add FastAPI stream and mock auth endpoints"
```

---

### Task 4: Angular app scaffold with Tailwind, ngx-charts, CDK, routing

**Files:**
- Create: `frontend/` (Angular CLI project)
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/styles.css`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `frontend/src/app/app.config.ts`

**Interfaces:**
- Produces: A running Angular app at `:4200` with Tailwind (dark mode `class` strategy), ngx-charts + CDK installed, and routes `/` (landing), `/login`, `/dashboard`.

- [ ] **Step 1: Generate the project**

```bash
cd "C:/Users/User/Documents/AI Analytics"
npx -y @angular/cli@latest new frontend --style=css --routing --ssr=false --skip-git
```

- [ ] **Step 2: Install dependencies**

```bash
cd frontend
npm install @swimlane/ngx-charts @angular/cdk d3
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init
```

- [ ] **Step 3: Configure Tailwind**

`frontend/tailwind.config.js`:
```js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: { extend: {} },
  plugins: [],
};
```

Create `frontend/postcss.config.js`:
```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

`frontend/src/styles.css` (prepend):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { height: 100%; }
body { @apply bg-slate-950 text-slate-100; }
```

- [ ] **Step 4: Register providers**

`frontend/src/app/app.config.ts` — add `provideAnimations()` (from `@angular/platform-browser/animations`) and `provideHttpClient()` (from `@angular/common/http`) to the providers array, keeping the existing router provider.

- [ ] **Step 5: Define routes (placeholders wired in later tasks)**

`frontend/src/app/app.routes.ts`:
```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => import('./auth/auth.guard').then(m => m.authGuard)],
  },
  { path: '**', redirectTo: '' },
];
```

Note: the lazy `canActivate` above will be simplified to a direct `authGuard` reference in Task 7 once the guard exists. For now, comment out the `canActivate` line so the app compiles.

- [ ] **Step 6: Verify the app builds and serves**

Run: `cd frontend && npm start`
Expected: compiles; `http://localhost:4200` loads without console errors. Stop the server.

- [ ] **Step 7: Commit**

```bash
cd "C:/Users/User/Documents/AI Analytics"
git add frontend
git commit -m "chore: scaffold Angular app with Tailwind, ngx-charts, CDK"
```

---

### Task 5: Metrics model + MetricsSocketService (typed WebSocket stream)

**Files:**
- Create: `frontend/src/app/core/metrics.model.ts`
- Create: `frontend/src/app/core/metrics-socket.service.ts`
- Test: `frontend/src/app/core/metrics-socket.service.spec.ts`

**Interfaces:**
- Produces: TS interfaces mirroring `docs/message-schema.md` (`MetricsSnapshot`, `Kpis`, `TrendPoint`, `ModelUsage`, `SourceLatency`, `Alert`, `TopModel`); `MetricsSocketService` with `snapshots$: Observable<MetricsSnapshot>`, `connected$: Observable<boolean>`, `connect(): void`, `disconnect(): void`. Auto-reconnect with exponential backoff.

- [ ] **Step 1: Write the metrics model**

`frontend/src/app/core/metrics.model.ts`:
```ts
export interface Kpis {
  totalPredictions: number;
  modelAccuracy: number;
  dataPoints: number;
  activeModels: number;
}
export interface TrendPoint { t: string; actual: number; predicted: number; }
export interface ModelUsage { name: string; percent: number; }
export interface SourceLatency { name: string; ms: number; }
export interface Alert { level: 'Critical' | 'Warning' | 'Info'; message: string; source: string; value: string; }
export interface TopModel { name: string; score: number; delta: number; }
export interface MetricsSnapshot {
  timestamp: string;
  kpis: Kpis;
  accuracyTrend: TrendPoint[];
  modelUsage: ModelUsage[];
  sourceLatencies: SourceLatency[];
  recentAlerts: Alert[];
  topModels: TopModel[];
}
```

- [ ] **Step 2: Write the failing service test**

`frontend/src/app/core/metrics-socket.service.spec.ts`:
```ts
import { MetricsSocketService } from './metrics-socket.service';
import { MetricsSnapshot } from './metrics.model';

class FakeSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  close() { this.onclose?.(); }
  emit(snap: MetricsSnapshot) { this.onmessage?.({ data: JSON.stringify(snap) }); }
}

function sample(): MetricsSnapshot {
  return {
    timestamp: 't', kpis: { totalPredictions: 1, modelAccuracy: 96.7, dataPoints: 2, activeModels: 42 },
    accuracyTrend: [], modelUsage: [], sourceLatencies: [], recentAlerts: [], topModels: [],
  };
}

describe('MetricsSocketService', () => {
  it('emits parsed snapshots from socket messages', () => {
    const fake = new FakeSocket();
    const service = new MetricsSocketService(() => fake as unknown as WebSocket);
    const received: MetricsSnapshot[] = [];
    service.snapshots$.subscribe(s => received.push(s));
    service.connect();
    fake.onopen?.();
    fake.emit(sample());
    expect(received.length).toBe(1);
    expect(received[0].kpis.modelAccuracy).toBe(96.7);
  });

  it('tracks connected state', () => {
    const fake = new FakeSocket();
    const service = new MetricsSocketService(() => fake as unknown as WebSocket);
    const states: boolean[] = [];
    service.connected$.subscribe(s => states.push(s));
    service.connect();
    fake.onopen?.();
    expect(states[states.length - 1]).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — cannot find `metrics-socket.service`.

- [ ] **Step 4: Implement the service**

`frontend/src/app/core/metrics-socket.service.ts`:
```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MetricsSnapshot } from './metrics.model';

type SocketFactory = (url: string) => WebSocket;

const DEFAULT_URL = 'ws://localhost:8000/stream';

@Injectable({ providedIn: 'root' })
export class MetricsSocketService {
  private socket: WebSocket | null = null;
  private backoffMs = 1000;
  private manuallyClosed = false;

  private snapshots = new Subject<MetricsSnapshot>();
  private connected = new BehaviorSubject<boolean>(false);
  readonly snapshots$ = this.snapshots.asObservable();
  readonly connected$ = this.connected.asObservable();

  constructor(private factory: SocketFactory = (url) => new WebSocket(url)) {}

  connect(url: string = DEFAULT_URL): void {
    this.manuallyClosed = false;
    this.socket = this.factory(url);
    this.socket.onopen = () => { this.connected.next(true); this.backoffMs = 1000; };
    this.socket.onmessage = (e: MessageEvent) => {
      this.snapshots.next(JSON.parse(e.data) as MetricsSnapshot);
    };
    this.socket.onclose = () => {
      this.connected.next(false);
      if (!this.manuallyClosed) {
        setTimeout(() => this.connect(url), this.backoffMs);
        this.backoffMs = Math.min(this.backoffMs * 2, 15000);
      }
    };
  }

  disconnect(): void {
    this.manuallyClosed = true;
    this.socket?.close();
    this.socket = null;
  }
}
```

Note: the constructor's injected `SocketFactory` is for tests; in production Angular DI supplies the default. Provide it via a factory token or default param as shown.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/core
git commit -m "feat: add metrics model and websocket service"
```

---

### Task 6: ThemeService (dark/light toggle, persisted)

**Files:**
- Create: `frontend/src/app/core/theme.service.ts`
- Test: `frontend/src/app/core/theme.service.spec.ts`

**Interfaces:**
- Produces: `ThemeService` with `theme$: Observable<'dark' | 'light'>`, `toggle(): void`, `init(): void`. Persists to `localStorage['aetherium-theme']`; toggles the `dark` class on `document.documentElement`.

- [ ] **Step 1: Write the failing test**

`frontend/src/app/core/theme.service.spec.ts`:
```ts
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to dark and sets the dark class', () => {
    const service = new ThemeService();
    service.init();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles to light and persists', () => {
    const service = new ThemeService();
    service.init();
    service.toggle();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('aetherium-theme')).toBe('light');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — cannot find `theme.service`.

- [ ] **Step 3: Implement the service**

`frontend/src/app/core/theme.service.ts`:
```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'dark' | 'light';
const KEY = 'aetherium-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private subject = new BehaviorSubject<Theme>('dark');
  readonly theme$ = this.subject.asObservable();

  init(): void {
    const stored = (localStorage.getItem(KEY) as Theme | null) ?? 'dark';
    this.apply(stored);
  }

  toggle(): void {
    this.apply(this.subject.value === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(KEY, theme);
    this.subject.next(theme);
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/theme.service.ts frontend/src/app/core/theme.service.spec.ts
git commit -m "feat: add persisted dark/light theme service"
```

---

### Task 7: Mock AuthService + AuthGuard, and LoginComponent

**Files:**
- Create: `frontend/src/app/auth/auth.service.ts`
- Create: `frontend/src/app/auth/auth.guard.ts`
- Create: `frontend/src/app/login/login.component.ts`
- Modify: `frontend/src/app/app.routes.ts`
- Test: `frontend/src/app/auth/auth.service.spec.ts`

**Interfaces:**
- Consumes: `HttpClient`, backend `POST /auth/login`.
- Produces: `AuthService` with `isAuthenticated(): boolean`, `login(username, password): Observable<void>`, `logout(): void`; functional `authGuard: CanActivateFn`. Token stored in `localStorage['aetherium-token']`.

- [ ] **Step 1: Write the failing test**

`frontend/src/app/auth/auth.service.spec.ts`:
```ts
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('is unauthenticated with no token', () => {
    const http = { post: () => ({ subscribe: () => {} }) } as any;
    const service = new AuthService(http);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('stores token and reports authenticated after setToken', () => {
    const http = {} as any;
    const service = new AuthService(http);
    service.setToken('abc');
    expect(service.isAuthenticated()).toBe(true);
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — cannot find `auth.service`.

- [ ] **Step 3: Implement AuthService and guard**

`frontend/src/app/auth/auth.service.ts`:
```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const KEY = 'aetherium-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<{ token: string }>('http://localhost:8000/auth/login', { username, password })
      .pipe(map(res => { this.setToken(res.token); }));
  }

  setToken(token: string): void { localStorage.setItem(KEY, token); }
  isAuthenticated(): boolean { return !!localStorage.getItem(KEY); }
  logout(): void { localStorage.removeItem(KEY); }
}
```

`frontend/src/app/auth/auth.guard.ts`:
```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
```

- [ ] **Step 4: Implement LoginComponent**

`frontend/src/app/login/login.component.ts` — standalone component with a centered card (Tailwind), username/password inputs bound with `FormsModule`, a "Sign In" button calling `auth.login(...)` then `router.navigate(['/dashboard'])`, and an error message on failure. Include a hint: "Demo — any credentials work."

- [ ] **Step 5: Wire the guard into routes**

`frontend/src/app/app.routes.ts` — replace the placeholder dashboard `canActivate` with:
```ts
import { authGuard } from './auth/auth.guard';
// ...
{ path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/auth frontend/src/app/login frontend/src/app/app.routes.ts
git commit -m "feat: add mock auth service, guard, and login screen"
```

---

### Task 8: Landing page + ProjectCardComponent (the showcase card)

**Files:**
- Create: `frontend/src/app/landing/landing.component.ts`
- Create: `frontend/src/app/shared/project-card.component.ts`

**Interfaces:**
- Consumes: Angular Router.
- Produces: `LandingComponent` (route `/`) rendering `ProjectCardComponent`; card's "Learn More" navigates to `/dashboard`.

- [ ] **Step 1: Implement ProjectCardComponent**

`frontend/src/app/shared/project-card.component.ts` — standalone component reproducing the screenshot card:
- Rounded dark panel with a subtle top glow.
- A mini dashboard preview image area at top (use a CSS mock: small KPI chips + faux chart bars; no real data needed).
- Category pill "AI/ML".
- Title "Aetherium AI Analytics Platform".
- Description: "Real-time predictive analytics dashboard with neural net metrics, customizable widgets, and sub-10ms query performance."
- Green live line: "Processing 4.2M events/sec".
- Tech chips: Angular, TypeScript, Node.js, Python, Tailwind, WebSockets (rendered from an array).
- "Learn More →" as a button with `(click)="go()"` calling `router.navigate(['/dashboard'])`.

Use Tailwind classes matching the screenshot palette (slate-950 background, cyan/teal accents, emerald for the live text).

- [ ] **Step 2: Implement LandingComponent**

`frontend/src/app/landing/landing.component.ts` — standalone component that centers `ProjectCardComponent` on the page with a dark gradient background.

- [ ] **Step 3: Manual visual check**

Run: `cd frontend && npm start` → visit `http://localhost:4200`. Confirm the card matches the screenshot layout and "Learn More" routes to `/login` (guard redirect, since not logged in). Stop the server.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/landing frontend/src/app/shared/project-card.component.ts
git commit -m "feat: add landing page and showcase project card"
```

---

### Task 9: Widget components (KPI tiles, charts, tables)

**Files:**
- Create: `frontend/src/app/widgets/kpi-tile.component.ts`
- Create: `frontend/src/app/widgets/accuracy-trend-chart.component.ts`
- Create: `frontend/src/app/widgets/model-usage-donut.component.ts`
- Create: `frontend/src/app/widgets/source-latency-bars.component.ts`
- Create: `frontend/src/app/widgets/recent-alerts-table.component.ts`
- Create: `frontend/src/app/widgets/top-models.component.ts`
- Test: `frontend/src/app/widgets/kpi-tile.component.spec.ts`

**Interfaces:**
- Consumes: model types from `core/metrics.model.ts`; `@swimlane/ngx-charts` (`NgxChartsModule`).
- Produces: Six standalone widget components, each taking an `@Input()` of the relevant slice of `MetricsSnapshot`:
  - `KpiTileComponent`: `@Input() label: string; @Input() value: string; @Input() delta?: string;`
  - `AccuracyTrendChartComponent`: `@Input() points: TrendPoint[]`
  - `ModelUsageDonutComponent`: `@Input() usage: ModelUsage[]`
  - `SourceLatencyBarsComponent`: `@Input() latencies: SourceLatency[]`
  - `RecentAlertsTableComponent`: `@Input() alerts: Alert[]`
  - `TopModelsComponent`: `@Input() models: TopModel[]`

- [ ] **Step 1: Write the failing KPI tile test**

`frontend/src/app/widgets/kpi-tile.component.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { KpiTileComponent } from './kpi-tile.component';

describe('KpiTileComponent', () => {
  it('renders label and value', () => {
    TestBed.configureTestingModule({ imports: [KpiTileComponent] });
    const fixture = TestBed.createComponent(KpiTileComponent);
    fixture.componentInstance.label = 'Model Accuracy';
    fixture.componentInstance.value = '96.7%';
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Model Accuracy');
    expect(text).toContain('96.7%');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — cannot find `kpi-tile.component`.

- [ ] **Step 3: Implement KpiTileComponent**

`frontend/src/app/widgets/kpi-tile.component.ts` — standalone; a rounded panel showing `label` (muted), `value` (large), and optional `delta` (emerald if starts with '+', rose otherwise). Tailwind styled.

- [ ] **Step 4: Run the KPI test to verify it passes**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS

- [ ] **Step 5: Implement the four ngx-charts / table widgets**

For each, import `NgxChartsModule` where charts are used:
- `AccuracyTrendChartComponent`: an area chart (`ngx-charts-area-chart`) with two series (Actual, Predicted) built from `points`. Map `points` → ngx-charts `[{ name, series: [{ name: t, value }] }]`.
- `ModelUsageDonutComponent`: `ngx-charts-pie-chart [doughnut]="true"` from `usage` mapped to `{ name, value: percent }`.
- `SourceLatencyBarsComponent`: `ngx-charts-bar-vertical` from `latencies` mapped to `{ name, value: ms }`.
- `RecentAlertsTableComponent`: a table listing `alerts` with a colored level badge (Critical=rose, Warning=amber, Info=sky), message, source, value.
- `TopModelsComponent`: a ranked list of `models` showing name, score, and delta with up/down arrow and color.

Use a shared cyan/teal/violet color scheme object so charts match the screenshot.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/widgets
git commit -m "feat: add dashboard widget components"
```

---

### Task 10: WidgetLayoutService (customizable grid persistence)

**Files:**
- Create: `frontend/src/app/dashboard/widget-layout.service.ts`
- Test: `frontend/src/app/dashboard/widget-layout.service.spec.ts`

**Interfaces:**
- Produces: `WidgetLayoutService` with `WidgetId` union type, `getLayout(): WidgetId[]`, `setLayout(ids: WidgetId[]): void`, `remove(id: WidgetId): void`, `add(id: WidgetId): void`, `available(): WidgetId[]`, `reset(): void`. Persists to `localStorage['aetherium-layout']`. Default layout includes all widgets.

- [ ] **Step 1: Write the failing test**

`frontend/src/app/dashboard/widget-layout.service.spec.ts`:
```ts
import { WidgetLayoutService, ALL_WIDGETS } from './widget-layout.service';

describe('WidgetLayoutService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to all widgets', () => {
    const s = new WidgetLayoutService();
    expect(s.getLayout()).toEqual([...ALL_WIDGETS]);
  });

  it('removes and re-adds a widget, persisting', () => {
    const s = new WidgetLayoutService();
    s.remove('donut');
    expect(s.getLayout()).not.toContain('donut');
    expect(s.available()).toContain('donut');
    const reloaded = new WidgetLayoutService();
    expect(reloaded.getLayout()).not.toContain('donut');
    s.add('donut');
    expect(s.getLayout()).toContain('donut');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — cannot find `widget-layout.service`.

- [ ] **Step 3: Implement the service**

`frontend/src/app/dashboard/widget-layout.service.ts`:
```ts
import { Injectable } from '@angular/core';

export type WidgetId =
  | 'kpis' | 'trend' | 'donut' | 'latency' | 'alerts' | 'topModels';

export const ALL_WIDGETS: WidgetId[] = ['kpis', 'trend', 'donut', 'latency', 'alerts', 'topModels'];
const KEY = 'aetherium-layout';

@Injectable({ providedIn: 'root' })
export class WidgetLayoutService {
  private layout: WidgetId[] = this.load();

  private load(): WidgetId[] {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...ALL_WIDGETS];
    try {
      const parsed = JSON.parse(raw) as WidgetId[];
      return parsed.filter(id => ALL_WIDGETS.includes(id));
    } catch { return [...ALL_WIDGETS]; }
  }

  private persist(): void { localStorage.setItem(KEY, JSON.stringify(this.layout)); }

  getLayout(): WidgetId[] { return [...this.layout]; }
  setLayout(ids: WidgetId[]): void { this.layout = [...ids]; this.persist(); }
  remove(id: WidgetId): void { this.layout = this.layout.filter(x => x !== id); this.persist(); }
  add(id: WidgetId): void {
    if (!this.layout.includes(id) && ALL_WIDGETS.includes(id)) { this.layout.push(id); this.persist(); }
  }
  available(): WidgetId[] { return ALL_WIDGETS.filter(id => !this.layout.includes(id)); }
  reset(): void { this.layout = [...ALL_WIDGETS]; this.persist(); }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/dashboard/widget-layout.service.ts frontend/src/app/dashboard/widget-layout.service.spec.ts
git commit -m "feat: add persisted widget layout service"
```

---

### Task 11: DashboardComponent — assemble grid, live data, drag/drop, theme toggle

**Files:**
- Create: `frontend/src/app/dashboard/dashboard.component.ts`
- Modify: `frontend/src/app/app.component.ts` (call `ThemeService.init()` on startup)

**Interfaces:**
- Consumes: `MetricsSocketService`, `ThemeService`, `WidgetLayoutService`, `AuthService`, all widget components, `DragDropModule` from `@angular/cdk/drag-drop`.
- Produces: `DashboardComponent` (route `/dashboard`) rendering the live grid.

- [ ] **Step 1: Initialize theme on app startup**

`frontend/src/app/app.component.ts` — inject `ThemeService` and call `init()` in `ngOnInit`.

- [ ] **Step 2: Implement DashboardComponent**

`frontend/src/app/dashboard/dashboard.component.ts` — standalone component:
- On `ngOnInit`: `socket.connect()`, subscribe to `snapshots$`, store latest snapshot in a signal/field; on `ngOnDestroy`: `socket.disconnect()`.
- Header bar: "Aetherium AI Analytics Platform" title, a live/disconnected indicator bound to `connected$`, a theme toggle button (`theme.toggle()`), a "Customize" toggle, and a "Sign Out" button (`auth.logout()` + navigate to `/`).
- Body: a CDK `cdkDropList` (`(cdkDropListDropped)` reorders and calls `layout.setLayout(...)`) rendering widgets in `layout.getLayout()` order. Each widget is a `cdkDrag` card; in Customize mode show a remove (×) button (`layout.remove(id)`) and an "Add widget" menu populated from `layout.available()`.
- Map `id → widget`: `kpis` renders a row of four `KpiTileComponent`s (format numbers: 8.9M, 96.7%, 512B, 42); `trend`→`AccuracyTrendChartComponent [points]`; `donut`→`ModelUsageDonutComponent [usage]`; `latency`→`SourceLatencyBarsComponent [latencies]`; `alerts`→`RecentAlertsTableComponent [alerts]`; `topModels`→`TopModelsComponent [models]`.
- Guard against null snapshot before first message (show a "Connecting…" skeleton).

- [ ] **Step 3: Add a number-formatting helper**

Inline in the component (or `frontend/src/app/core/format.ts`): `formatCompact(n: number): string` → `8_900_000 → "8.9M"`, `512_000_000_000 → "512B"`. Write a small spec `frontend/src/app/core/format.spec.ts` covering M/B/K boundaries.

- [ ] **Step 4: Run the format test to verify it passes**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS

- [ ] **Step 5: Full manual verification**

Run backend (`cd backend && uvicorn app.main:app --reload`) and frontend (`cd frontend && npm start`) together.
- Visit `/`, click Learn More → redirected to `/login`.
- Log in with any credentials → `/dashboard` loads.
- Confirm: KPI tiles update live, charts animate, alerts refresh every ~1.5s, connected indicator is green.
- Toggle theme → light mode applies and persists on reload.
- Enter Customize → drag a widget to reorder, remove one, add it back; reload and confirm layout persisted.
- Stop the backend → indicator goes red; restart → auto-reconnects.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/dashboard frontend/src/app/app.component.ts frontend/src/app/core
git commit -m "feat: assemble live customizable dashboard"
```

---

### Task 12: Run-both convenience script, full test pass, and docs

**Files:**
- Create: `dev.ps1`
- Modify: `README.md`

**Interfaces:**
- Produces: A single script to start backend and frontend; a README verified end-to-end.

- [ ] **Step 1: Create the dev launcher**

`dev.ps1` (PowerShell): starts uvicorn in one job and `npm start` in another, printing both URLs. Include a Bash equivalent snippet in the README for non-Windows users.

- [ ] **Step 2: Run the full backend test suite**

Run: `cd backend && python -m pytest -v`
Expected: all tests PASS.

- [ ] **Step 3: Run the full frontend test suite**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: all specs PASS.

- [ ] **Step 4: Finalize README**

Document: architecture diagram, how to run both apps (script + manual), how to log in (any credentials), how to customize widgets, and how the simulated data works.

- [ ] **Step 5: Commit**

```bash
git add dev.ps1 README.md
git commit -m "docs: add dev launcher and finalize README"
```

---

## Notes for the implementer

- Windows shell is PowerShell; a Bash tool is also available. `cd "C:/Users/User/Documents/AI Analytics"` paths use forward slashes safely in both.
- Angular CLI version, ngx-charts, and CDK should be installed at latest compatible versions; if `npm test` needs ChromeHeadless and none is present, install `puppeteer` or point `CHROME_BIN` at an installed Chrome.
- Keep frontend `MetricsSnapshot` interface byte-for-byte aligned with `docs/message-schema.md`. If you change one, change both.
