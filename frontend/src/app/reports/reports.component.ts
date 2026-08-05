import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MetricsSocketService } from '../core/metrics-socket.service';
import { MetricsSnapshot } from '../core/metrics.model';
import {
  alertsToRows,
  downloadFile,
  kpisToRows,
  modelUsageToRows,
  sourceLatenciesToRows,
  toCsv,
  toJson,
  topModelsToRows,
} from '../core/export.util';

type ReportSection = 'topModels' | 'modelUsage' | 'sourceLatencies' | 'recentAlerts' | 'kpis';

interface ReportCard {
  section: ReportSection;
  title: string;
  description: string;
  icon: string;
  rowCount: (snap: MetricsSnapshot) => number;
  toRows: (snap: MetricsSnapshot) => Record<string, string | number>[];
  toJsonData: (snap: MetricsSnapshot) => unknown;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Reports</h1>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Export analytics snapshots and summaries</p>
        </div>

        <button
          type="button"
          [disabled]="!snapshot"
          (click)="exportFullSnapshot()"
          class="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export full snapshot (JSON)
        </button>
      </div>

      <div class="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div
          *ngFor="let card of cards"
          class="min-w-0 rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 sm:p-5"
        >
          <div class="flex items-start gap-3">
            <div class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="iconPath(card.icon)" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ card.title }}</h2>
              <p class="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{{ card.description }}</p>
              <p class="mt-2 text-xs text-slate-400 dark:text-slate-500">
                {{ snapshot ? card.rowCount(snapshot) + ' rows • generated ' + relativeTime : 'Waiting for data…' }}
              </p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              [disabled]="!snapshot"
              (click)="exportCsv(card)"
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-100 dark:ring-white/10 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              type="button"
              [disabled]="!snapshot"
              (click)="exportJson(card)"
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-100 dark:ring-white/10 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReportsComponent implements OnInit, OnDestroy {
  snapshot: MetricsSnapshot | null = null;

  readonly cards: ReportCard[] = [
    {
      section: 'topModels',
      title: 'Model Performance',
      description: 'Top-performing models ranked by score, with delta since last period.',
      icon: 'trophy',
      rowCount: (s) => s.topModels.length,
      toRows: topModelsToRows,
      toJsonData: (s) => s.topModels,
    },
    {
      section: 'modelUsage',
      title: 'Model Usage Breakdown',
      description: 'Share of traffic served by each active model.',
      icon: 'chart',
      rowCount: (s) => s.modelUsage.length,
      toRows: modelUsageToRows,
      toJsonData: (s) => s.modelUsage,
    },
    {
      section: 'sourceLatencies',
      title: 'Source Latencies',
      description: 'Average response latency by data source.',
      icon: 'clock',
      rowCount: (s) => s.sourceLatencies.length,
      toRows: sourceLatenciesToRows,
      toJsonData: (s) => s.sourceLatencies,
    },
    {
      section: 'recentAlerts',
      title: 'Alert Digest',
      description: 'Recent critical, warning, and informational alerts.',
      icon: 'bell',
      rowCount: (s) => s.recentAlerts.length,
      toRows: alertsToRows,
      toJsonData: (s) => s.recentAlerts,
    },
    {
      section: 'kpis',
      title: 'KPI Summary',
      description: 'Headline platform metrics as a flat summary table.',
      icon: 'document',
      rowCount: () => 4,
      toRows: kpisToRows,
      toJsonData: (s) => s.kpis,
    },
  ];

  private sub: Subscription | null = null;
  private nowTick: number = Date.now();
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private socket: MetricsSocketService) {}

  ngOnInit(): void {
    this.socket.connect();
    this.sub = this.socket.snapshots$.subscribe((snap) => (this.snapshot = snap));
    this.tickTimer = setInterval(() => (this.nowTick = Date.now()), 1000);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.tickTimer !== null) {
      clearInterval(this.tickTimer);
    }
  }

  get relativeTime(): string {
    if (!this.snapshot) {
      return '';
    }
    const deltaSec = Math.max(0, Math.round((this.nowTick - new Date(this.snapshot.timestamp).getTime()) / 1000));
    if (deltaSec < 5) {
      return 'just now';
    }
    if (deltaSec < 60) {
      return `${deltaSec}s ago`;
    }
    const min = Math.round(deltaSec / 60);
    return `${min}m ago`;
  }

  exportCsv(card: ReportCard): void {
    if (!this.snapshot) {
      return;
    }
    const ts = this.stamp();
    downloadFile(`aetherium-${card.section}-${ts}.csv`, toCsv(card.toRows(this.snapshot)), 'text/csv');
  }

  exportJson(card: ReportCard): void {
    if (!this.snapshot) {
      return;
    }
    const ts = this.stamp();
    downloadFile(`aetherium-${card.section}-${ts}.json`, toJson(card.toJsonData(this.snapshot)), 'application/json');
  }

  exportFullSnapshot(): void {
    if (!this.snapshot) {
      return;
    }
    const ts = this.stamp();
    downloadFile(`aetherium-dashboard-${ts}.json`, toJson(this.snapshot), 'application/json');
  }

  private stamp(): string {
    return String(Date.now());
  }

  iconPath(icon: string): string {
    switch (icon) {
      case 'trophy':
        return 'M8 21h8M12 17v4M7 4h10v3a5 5 0 01-10 0V4zM7 5H4v1a3 3 0 003 3M17 5h3v1a3 3 0 01-3 3';
      case 'clock':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'bell':
        return 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9';
      case 'chart':
        return 'M3 3v18h18M8 17V10m5 7V7m5 10v-4';
      default:
        return 'M9 12h6m-6 4h6m1 5H8a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    }
  }
}
