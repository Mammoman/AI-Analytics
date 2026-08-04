import {
  Alert,
  MetricsSnapshot,
  ModelUsage,
  SourceLatency,
  TopModel,
  TrendPoint,
} from './metrics.model';

const MODEL_NAMES = ['Model A', 'Model B', 'Model C', 'Model D'];
const SOURCE_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ALERT_LEVELS: Array<'Critical' | 'Warning' | 'Info'> = ['Critical', 'Warning', 'Info'];
const ALERT_WEIGHTS = [1, 3, 6];
const ALERT_MESSAGES = [
  'Node latency spike',
  'Model drift detected',
  'Ingest backlog',
  'Accuracy dip',
  'Cache miss surge',
  'Replica rebalanced',
];

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

function uniform(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randint(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function weightedChoice<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function choice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Client-side port of backend/app/simulator.py's MetricsSimulator, used when
 * environment.useMockData is true (production/standalone Vercel deploy).
 * Uses Math.random() instead of a seeded RNG — no determinism guarantees.
 */
export class MetricsSimulator {
  private accuracy = 96.7;
  private totalPredictions = 8_900_000;
  private dataPoints = 512_000_000_000;
  private activeModels = 42;
  private usage = [28.0, 25.0, 25.0, 22.0];
  private trend: number[] = Array.from({ length: 24 }, () => this.accuracy);

  private stepUsage(): number[] {
    const deltas = this.usage.map(() => uniform(-1.0, 1.0));
    const raw = this.usage.map((u, i) => clamp(u + deltas[i], 5.0, 60.0));
    const total = raw.reduce((s, r) => s + r, 0);
    this.usage = raw.map((r) => round1((r / total) * 100.0));
    const residual = round1(100.0 - this.usage.reduce((s, u) => s + u, 0));
    let iMax = 0;
    for (let i = 1; i < this.usage.length; i++) {
      if (this.usage[i] > this.usage[iMax]) iMax = i;
    }
    this.usage[iMax] = round1(this.usage[iMax] + residual);
    return this.usage;
  }

  tick(): MetricsSnapshot {
    this.accuracy = round1(clamp(this.accuracy + uniform(-0.4, 0.4), 90.0, 99.9));
    this.totalPredictions += randint(1_000, 20_000);
    this.dataPoints += randint(1_000_000, 50_000_000);
    this.activeModels = clamp(this.activeModels + randint(-1, 1), 30, 60);

    this.trend = [...this.trend.slice(1), this.accuracy];
    const accuracyTrend: TrendPoint[] = this.trend.map((v, i) => ({
      t: `${String(i).padStart(2, '0')}:00`,
      actual: round1(v),
      predicted: round1(clamp(v + uniform(-0.6, 0.6), 90.0, 99.9)),
    }));

    const usageValues = this.stepUsage();
    const modelUsage: ModelUsage[] = MODEL_NAMES.map((name, i) => ({
      name,
      percent: usageValues[i],
    }));

    const sourceLatencies: SourceLatency[] = SOURCE_NAMES.map((name) => ({
      name,
      ms: randint(8, 60),
    }));

    const recentAlerts: Alert[] = Array.from({ length: 4 }, () => {
      const level = weightedChoice(ALERT_LEVELS, ALERT_WEIGHTS);
      return {
        level,
        message: choice(ALERT_MESSAGES),
        source: `ALSA-${randint(1, 9)}`,
        value: level,
      };
    });

    const topModels: TopModel[] = MODEL_NAMES.map((name) => ({
      name,
      score: round1(uniform(90.0, 99.9)),
      delta: round1(uniform(-1.0, 1.0)),
    })).sort((a, b) => b.score - a.score);

    return {
      timestamp: new Date().toISOString(),
      kpis: {
        totalPredictions: this.totalPredictions,
        modelAccuracy: this.accuracy,
        dataPoints: this.dataPoints,
        activeModels: this.activeModels,
      },
      accuracyTrend,
      modelUsage,
      sourceLatencies,
      recentAlerts,
      topModels,
    };
  }
}
