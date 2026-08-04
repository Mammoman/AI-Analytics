import { Injectable } from '@angular/core';
import { Kpis, MetricsSnapshot, TrendPoint } from './metrics.model';

interface HistoryEntry {
  at: number;
  kpis: Kpis;
}

const EMA_ALPHA = 0.3;

@Injectable({ providedIn: 'root' })
export class MetricsHistoryService {
  private entries: HistoryEntry[] = [];
  private readonly maxMs = 15 * 60 * 1000;

  push(snap: MetricsSnapshot, now: number = Date.now()): void {
    this.entries.push({ at: now, kpis: snap.kpis });
    const cutoff = now - this.maxMs;
    this.entries = this.entries.filter((entry) => entry.at >= cutoff);
  }

  kpiSeries(key: keyof Kpis, windowMs: number, now: number = Date.now()): number[] {
    return this.entriesInWindow(windowMs, now).map((entry) => entry.kpis[key]);
  }

  accuracyTrend(windowMs: number, now: number = Date.now()): TrendPoint[] {
    const windowed = this.entriesInWindow(windowMs, now);
    let ema: number | null = null;

    return windowed.map((entry) => {
      const actual = entry.kpis.modelAccuracy;
      ema = ema === null ? actual : EMA_ALPHA * actual + (1 - EMA_ALPHA) * ema;
      return {
        t: this.clockLabel(entry.at),
        actual: this.round1(actual),
        predicted: this.round1(ema),
      };
    });
  }

  count(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries = [];
  }

  private entriesInWindow(windowMs: number, now: number): HistoryEntry[] {
    const from = now - windowMs;
    return this.entries.filter((entry) => entry.at >= from && entry.at <= now);
  }

  private round1(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private clockLabel(at: number): string {
    const date = new Date(at);
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
