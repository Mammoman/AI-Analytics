import { MetricsHistoryService } from './metrics-history.service';
import { MetricsSnapshot, TrendPoint } from './metrics.model';

function makeSnapshot(modelAccuracy: number): MetricsSnapshot {
  return {
    timestamp: new Date(0).toISOString(),
    kpis: {
      totalPredictions: 100,
      modelAccuracy,
      dataPoints: 10,
      activeModels: 3,
    },
    accuracyTrend: [],
    modelUsage: [],
    sourceLatencies: [],
    recentAlerts: [],
    topModels: [],
  };
}

describe('MetricsHistoryService', () => {
  it('accumulates pushes and evicts entries older than 15 minutes', () => {
    const service = new MetricsHistoryService();
    const now = 20 * 60 * 1000; // 20 minutes in ms

    service.push(makeSnapshot(90), 0); // will be older than 15 min relative to `now`
    expect(service.count()).toBe(1);

    service.push(makeSnapshot(95), now);
    // Eviction happens on push; the t=0 entry should be gone now (20min - 0 > 15min)
    expect(service.count()).toBe(1);

    const series = service.kpiSeries('modelAccuracy', 15 * 60 * 1000, now);
    expect(series).toEqual([95]);
  });

  it('kpiSeries returns only values within the window, in chronological order', () => {
    const service = new MetricsHistoryService();
    const now = 100_000;

    service.push(makeSnapshot(10), now - 90_000); // outside 60s window
    service.push(makeSnapshot(20), now - 50_000); // inside
    service.push(makeSnapshot(30), now - 10_000); // inside
    service.push(makeSnapshot(40), now); // inside

    const series = service.kpiSeries('modelAccuracy', 60_000, now);
    expect(series).toEqual([20, 30, 40]);
  });

  it('accuracyTrend builds TrendPoints with actual values and an EMA-based predicted line', () => {
    const service = new MetricsHistoryService();
    const now = 100_000;

    service.push(makeSnapshot(80), now - 40_000);
    service.push(makeSnapshot(90), now - 30_000);
    service.push(makeSnapshot(70), now - 20_000);
    service.push(makeSnapshot(85), now - 10_000);

    const trend = service.accuracyTrend(300_000, now);

    expect(trend.length).toBe(4);
    expect(trend.map((p: TrendPoint) => p.actual)).toEqual([80, 90, 70, 85]);

    // EMA seeds on the first actual value
    expect(trend[0].predicted).toBe(80);

    const actuals = trend.map((p: TrendPoint) => p.actual);
    const min = Math.min(...actuals);
    const max = Math.max(...actuals);
    for (const point of trend) {
      expect(point.predicted).toBeGreaterThanOrEqual(min);
      expect(point.predicted).toBeLessThanOrEqual(max);
    }

    // t label should be a zero-padded mm:ss clock string
    for (const point of trend) {
      expect(point.t).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('clear empties the buffer', () => {
    const service = new MetricsHistoryService();
    service.push(makeSnapshot(50), 1000);
    expect(service.count()).toBe(1);

    service.clear();
    expect(service.count()).toBe(0);
  });
});
