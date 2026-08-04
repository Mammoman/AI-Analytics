import { MetricsSimulator } from './metrics-simulator';

describe('MetricsSimulator', () => {
  it('produces valid snapshots over many ticks', () => {
    const sim = new MetricsSimulator();
    let prevTotalPredictions = -Infinity;

    for (let i = 0; i < 200; i++) {
      const snap = sim.tick();

      // Accuracy bounds
      expect(snap.kpis.modelAccuracy).toBeGreaterThanOrEqual(90);
      expect(snap.kpis.modelAccuracy).toBeLessThanOrEqual(100);

      // Active models bounds (30..60 per python simulator)
      expect(snap.kpis.activeModels).toBeGreaterThanOrEqual(30);
      expect(snap.kpis.activeModels).toBeLessThanOrEqual(60);

      // totalPredictions strictly increases
      expect(snap.kpis.totalPredictions).toBeGreaterThan(prevTotalPredictions);
      prevTotalPredictions = snap.kpis.totalPredictions;

      // modelUsage: exactly 4, sums to ~100
      expect(snap.modelUsage.length).toBe(4);
      const usageSum = snap.modelUsage.reduce((s, m) => s + m.percent, 0);
      expect(usageSum).toBeGreaterThanOrEqual(99.5);
      expect(usageSum).toBeLessThanOrEqual(100.5);

      // sourceLatencies: exactly 7
      expect(snap.sourceLatencies.length).toBe(7);
      for (const sl of snap.sourceLatencies) {
        expect(sl.ms).toBeGreaterThanOrEqual(8);
        expect(sl.ms).toBeLessThanOrEqual(60);
      }

      // accuracyTrend: exactly 24 points
      expect(snap.accuracyTrend.length).toBe(24);
      for (const pt of snap.accuracyTrend) {
        expect(pt.actual).toBeGreaterThanOrEqual(90);
        expect(pt.actual).toBeLessThanOrEqual(100);
        expect(pt.predicted).toBeGreaterThanOrEqual(90);
        expect(pt.predicted).toBeLessThanOrEqual(100);
      }

      // recentAlerts: exactly 4, valid levels
      expect(snap.recentAlerts.length).toBe(4);
      for (const a of snap.recentAlerts) {
        expect(['Critical', 'Warning', 'Info']).toContain(a.level);
        expect(a.value).toBe(a.level);
      }

      // topModels: at least 1, sorted descending by score
      expect(snap.topModels.length).toBeGreaterThanOrEqual(1);
      for (let j = 1; j < snap.topModels.length; j++) {
        expect(snap.topModels[j - 1].score).toBeGreaterThanOrEqual(snap.topModels[j].score);
      }

      expect(typeof snap.timestamp).toBe('string');
    }
  });
});
