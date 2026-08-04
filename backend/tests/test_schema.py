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
