import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Prediction } from './metrics.model';

const MODEL_NAMES = ['Model A', 'Model B', 'Model C', 'Model D'];
const HORIZONS = ['1h', '6h', '24h'];

const CONFIDENCE_BASE: Record<string, number> = {
  '1h': 97,
  '6h': 92,
  '24h': 85,
};

const REFRESH_MS = 3000;

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

function uniform(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

interface RowState {
  id: string;
  model: string;
  horizon: string;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'flat';
}

@Injectable({ providedIn: 'root' })
export class PredictionsService implements OnDestroy {
  private rows: RowState[] = [];
  private readonly subject: BehaviorSubject<Prediction[]>;
  readonly predictions$: Observable<Prediction[]>;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  constructor() {
    this.rows = this.buildInitialRows();
    this.subject = new BehaviorSubject<Prediction[]>(this.toPredictions(this.rows));
    this.predictions$ = this.subject.asObservable();
    this.start();
  }

  private buildInitialRows(): RowState[] {
    const rows: RowState[] = [];
    for (const model of MODEL_NAMES) {
      for (const horizon of HORIZONS) {
        rows.push({
          id: `${model}-${horizon}`,
          model,
          horizon,
          predicted: round1(uniform(90, 99.9)),
          confidence: round1(clamp(CONFIDENCE_BASE[horizon] + uniform(-3, 3), 60, 99.9)),
          trend: 'flat',
        });
      }
    }
    return rows;
  }

  private toPredictions(rows: RowState[]): Prediction[] {
    const now = new Date().toISOString();
    return rows.map((r) => ({
      id: r.id,
      model: r.model,
      horizon: r.horizon,
      predicted: r.predicted,
      confidence: r.confidence,
      trend: r.trend,
      updatedAt: now,
    }));
  }

  current(): Prediction[] {
    return this.subject.getValue();
  }

  refresh(): void {
    this.rows = this.rows.map((r) => {
      const prevPredicted = r.predicted;
      const nextPredicted = round1(clamp(prevPredicted + uniform(-0.5, 0.5), 90, 99.9));
      const nextConfidence = round1(
        clamp(CONFIDENCE_BASE[r.horizon] + uniform(-3, 3), 60, 99.9),
      );
      const delta = nextPredicted - prevPredicted;
      let trend: 'up' | 'down' | 'flat' = 'flat';
      if (delta > 0.05) trend = 'up';
      else if (delta < -0.05) trend = 'down';

      return {
        ...r,
        predicted: nextPredicted,
        confidence: nextConfidence,
        trend,
      };
    });

    this.subject.next(this.toPredictions(this.rows));
  }

  start(): void {
    if (this.intervalId !== undefined) return;
    this.intervalId = setInterval(() => this.refresh(), REFRESH_MS);
  }

  stop(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
