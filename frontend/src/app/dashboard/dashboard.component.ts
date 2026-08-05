import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { MetricsSocketService } from '../core/metrics-socket.service';
import { MetricsSnapshot, TrendPoint } from '../core/metrics.model';
import { ThemeService } from '../core/theme.service';
import { WidgetLayoutService, WidgetId } from './widget-layout.service';
import { formatCompact } from '../core/format';
import { MetricsHistoryService } from '../core/metrics-history.service';
import { ToastService } from '../core/toast.service';
import { SettingsService } from '../core/settings.service';
import { ToastContainerComponent } from '../shared/toast-container.component';

import { KpiTileComponent } from '../widgets/kpi-tile.component';
import { AccuracyTrendChartComponent } from '../widgets/accuracy-trend-chart.component';
import { ModelUsageDonutComponent } from '../widgets/model-usage-donut.component';
import { SourceLatencyBarsComponent } from '../widgets/source-latency-bars.component';
import { RecentAlertsTableComponent } from '../widgets/recent-alerts-table.component';
import { TopModelsComponent } from '../widgets/top-models.component';

type KpiSparkKey = 'totalPredictions' | 'modelAccuracy' | 'dataPoints' | 'activeModels';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    KpiTileComponent,
    AccuracyTrendChartComponent,
    ModelUsageDonutComponent,
    SourceLatencyBarsComponent,
    RecentAlertsTableComponent,
    TopModelsComponent,
    ToastContainerComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header class="sticky top-0 z-10 flex flex-col gap-3 border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur dark:border-white/5 dark:bg-slate-950/90 sm:px-4 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-6">
        <h1 class="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">Aetherium AI Analytics Platform</h1>

        <div class="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
          <div class="flex items-center gap-1 rounded-lg p-1 ring-1 ring-slate-200 dark:ring-white/10">
            <button
              *ngFor="let opt of rangeOptions"
              type="button"
              class="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              [ngClass]="{ 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300': rangeMs === opt.ms }"
              (click)="setRange(opt.ms)"
            >
              {{ opt.label }}
            </button>
          </div>

          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-slate-200 hover:bg-slate-100 dark:ring-white/10 dark:hover:bg-white/5"
            [ngClass]="{ 'bg-amber-500/20 text-amber-600 dark:text-amber-300': paused }"
            (click)="togglePause()"
          >
            {{ paused ? 'Resume' : 'Pause' }}
          </button>

          <div class="flex items-center gap-2 text-sm">
            <span
              class="h-2.5 w-2.5 shrink-0 rounded-full"
              [class.bg-emerald-400]="connected && !paused"
              [class.bg-amber-500]="connected && paused"
              [class.bg-rose-500]="!connected"
            ></span>
            <span class="text-slate-600 dark:text-slate-400">{{ connected ? (paused ? 'Paused' : 'Live') : 'Disconnected' }}</span>
            <span class="hidden text-slate-400 dark:text-slate-500 sm:inline">{{ agoLabel }}</span>
          </div>

          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-slate-200 hover:bg-slate-100 dark:ring-white/10 dark:hover:bg-white/5"
            [ngClass]="{ 'bg-cyan-500/20': customizing, 'text-cyan-300': customizing }"
            (click)="customizing = !customizing"
          >
            Customize
          </button>
        </div>
      </header>

      <main class="p-3 sm:p-4 lg:p-6">
        <!-- Connecting skeleton -->
        <div *ngIf="!snapshot" class="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div class="text-sm text-slate-600 dark:text-slate-400 md:col-span-2 xl:col-span-3">Connecting&hellip;</div>
          <div *ngFor="let n of [1, 2, 3, 4, 5, 6]" class="h-40 animate-pulse rounded-xl bg-slate-200 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5"></div>
        </div>

        <ng-container *ngIf="snapshot">
          <div
            cdkDropList
            (cdkDropListDropped)="onDrop($event)"
            [cdkDropListDisabled]="!customizing"
            class="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2"
          >
            <div
              *ngFor="let id of layout"
              cdkDrag
              class="widget relative min-w-0"
              [class.lg:col-span-2]="id === 'kpis'"
            >
              <button
                *ngIf="customizing"
                type="button"
                class="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow"
                (click)="removeWidget(id)"
                aria-label="Remove widget"
              >
                &times;
              </button>

              <div *ngIf="customizing" cdkDragHandle class="mb-1 cursor-move text-center text-xs text-slate-500 dark:text-slate-500">&#8942;&#8942; drag &#8942;&#8942;</div>

              @switch (id) {
                @case ('kpis') {
                  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <app-kpi-tile label="Total Predictions" [value]="fmt(snapshot.kpis.totalPredictions)" [history]="kpiSpark.totalPredictions"></app-kpi-tile>
                    <app-kpi-tile label="Model Accuracy" [value]="snapshot.kpis.modelAccuracy + '%'" [history]="kpiSpark.modelAccuracy"></app-kpi-tile>
                    <app-kpi-tile label="Data Points" [value]="fmt(snapshot.kpis.dataPoints)" [history]="kpiSpark.dataPoints"></app-kpi-tile>
                    <app-kpi-tile label="Active Models" [value]="'' + snapshot.kpis.activeModels" [history]="kpiSpark.activeModels"></app-kpi-tile>
                  </div>
                }
                @case ('trend') {
                  <app-accuracy-trend-chart [points]="trendPoints"></app-accuracy-trend-chart>
                }
                @case ('donut') {
                  <app-model-usage-donut [usage]="snapshot.modelUsage"></app-model-usage-donut>
                }
                @case ('latency') {
                  <app-source-latency-bars [latencies]="snapshot.sourceLatencies"></app-source-latency-bars>
                }
                @case ('alerts') {
                  <app-recent-alerts-table [alerts]="snapshot.recentAlerts"></app-recent-alerts-table>
                }
                @case ('topModels') {
                  <app-top-models [models]="snapshot.topModels"></app-top-models>
                }
              }
            </div>
          </div>

          <div *ngIf="customizing && layoutSvc.available().length" class="mt-6 rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5">
            <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">Add widget</h3>
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let id of layoutSvc.available()"
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-white/5"
                (click)="addWidget(id)"
              >
                + {{ id }}
              </button>
            </div>
          </div>
        </ng-container>
      </main>

      <app-toast-container></app-toast-container>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  snapshot: MetricsSnapshot | null = null;
  connected = false;
  customizing = false;
  isLightTheme = false;
  layout: WidgetId[] = [];

  paused = false;
  rangeMs = 300_000;
  lastUpdate = 0;
  agoLabel = '—';
  trendPoints: TrendPoint[] = [];
  kpiSpark: Record<KpiSparkKey, number[]> = {
    totalPredictions: [],
    modelAccuracy: [],
    dataPoints: [],
    activeModels: [],
  };

  readonly rangeOptions: { label: string; ms: number }[] = [
    { label: '1m', ms: 60_000 },
    { label: '5m', ms: 300_000 },
    { label: '15m', ms: 900_000 },
  ];

  fmt = formatCompact;

  private subs = new Subscription();
  private agoIntervalId: ReturnType<typeof setInterval> | null = null;

  private lastCriticalToastAt = 0;
  private seenCritical = new Set<string>();

  constructor(
    public socket: MetricsSocketService,
    public theme: ThemeService,
    public layoutSvc: WidgetLayoutService,
    private history: MetricsHistoryService,
    private toast: ToastService,
    private settings: SettingsService,
  ) {}

  ngOnInit(): void {
    this.layout = this.layoutSvc.getLayout();

    this.socket.connect();
    this.subs.add(this.socket.snapshots$.subscribe((snap) => this.onSnapshot(snap)));
    this.subs.add(this.socket.connected$.subscribe((c) => (this.connected = c)));
    this.subs.add(this.theme.theme$.subscribe((t) => (this.isLightTheme = t === 'light')));

    const updateAgoLabel = () => {
      this.agoLabel = this.lastUpdate === 0 ? '—' : `updated ${Math.round((Date.now() - this.lastUpdate) / 1000)}s ago`;
    };
    updateAgoLabel();
    this.agoIntervalId = setInterval(updateAgoLabel, 1000);

    this.recomputeDerived();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.socket.disconnect();
    if (this.agoIntervalId !== null) {
      clearInterval(this.agoIntervalId);
    }
  }

  onSnapshot(snap: MetricsSnapshot): void {
    if (this.paused) {
      return;
    }
    this.history.push(snap);
    this.snapshot = snap;
    this.lastUpdate = Date.now();
    this.recomputeDerived();
    this.checkCriticalToasts(snap);
  }

  setRange(ms: number): void {
    this.rangeMs = ms;
    this.recomputeDerived();
  }

  togglePause(): void {
    this.paused = !this.paused;
  }

  private recomputeDerived(): void {
    this.trendPoints = this.history.accuracyTrend(this.rangeMs);
    this.kpiSpark = {
      totalPredictions: this.history.kpiSeries('totalPredictions', this.rangeMs),
      modelAccuracy: this.history.kpiSeries('modelAccuracy', this.rangeMs),
      dataPoints: this.history.kpiSeries('dataPoints', this.rangeMs),
      activeModels: this.history.kpiSeries('activeModels', this.rangeMs),
    };
  }

  private checkCriticalToasts(snap: MetricsSnapshot): void {
    for (const alert of snap.recentAlerts) {
      if (alert.level !== 'Critical') {
        continue;
      }
      const key = alert.message + '|' + alert.source;
      if (!this.seenCritical.has(key) && Date.now() - this.lastCriticalToastAt > 6000) {
        if (this.settings.current.notificationsEnabled) {
          this.toast.show('Critical: ' + alert.message + ' (' + alert.source + ')', 'Critical', 5000);
        }
        this.lastCriticalToastAt = Date.now();
        this.seenCritical.add(key);
        if (this.seenCritical.size > 50) {
          const oldest = this.seenCritical.values().next().value;
          if (oldest !== undefined) this.seenCritical.delete(oldest);
        }
        break;
      }
    }
  }

  onDrop(event: CdkDragDrop<WidgetId[]>): void {
    moveItemInArray(this.layout, event.previousIndex, event.currentIndex);
    this.layoutSvc.setLayout(this.layout);
  }

  removeWidget(id: WidgetId): void {
    this.layoutSvc.remove(id);
    this.layout = this.layoutSvc.getLayout();
  }

  addWidget(id: WidgetId): void {
    this.layoutSvc.add(id);
    this.layout = this.layoutSvc.getLayout();
  }
}
