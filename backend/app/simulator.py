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
