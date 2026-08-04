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
    a.pop("timestamp"); b.pop("timestamp")
    assert a == b
