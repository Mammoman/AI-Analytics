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
