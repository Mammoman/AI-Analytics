import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { MetricsSocketService } from '../core/metrics-socket.service';
import { MetricsSnapshot } from '../core/metrics.model';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../auth/auth.service';
import { WidgetLayoutService, WidgetId } from './widget-layout.service';
import { formatCompact } from '../core/format';

import { KpiTileComponent } from '../widgets/kpi-tile.component';
import { AccuracyTrendChartComponent } from '../widgets/accuracy-trend-chart.component';
import { ModelUsageDonutComponent } from '../widgets/model-usage-donut.component';
import { SourceLatencyBarsComponent } from '../widgets/source-latency-bars.component';
import { RecentAlertsTableComponent } from '../widgets/recent-alerts-table.component';
import { TopModelsComponent } from '../widgets/top-models.component';

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
  ],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      <header class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/5 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <h1 class="text-lg font-semibold tracking-tight text-white">Aetherium AI Analytics Platform</h1>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm">
            <span
              class="h-2.5 w-2.5 rounded-full"
              [class.bg-emerald-400]="connected"
              [class.bg-rose-500]="!connected"
            ></span>
            <span class="text-slate-400">{{ connected ? 'Live' : 'Disconnected' }}</span>
          </div>

          <button
            type="button"
            class="rounded-lg p-2 text-slate-300 ring-1 ring-white/10 hover:bg-white/5"
            (click)="theme.toggle()"
            aria-label="Toggle theme"
          >
            <span *ngIf="!isLightTheme">🌙</span>
            <span *ngIf="isLightTheme">☀️</span>
          </button>

          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-white/10 hover:bg-white/5"
            [ngClass]="{ 'bg-cyan-500/20': customizing, 'text-cyan-300': customizing }"
            (click)="customizing = !customizing"
          >
            Customize
          </button>

          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-rose-300 ring-1 ring-white/10 hover:bg-rose-500/10"
            (click)="signOut()"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main class="p-6">
        <!-- Connecting skeleton -->
        <div *ngIf="!snapshot" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div class="text-sm text-slate-400 md:col-span-2 xl:col-span-3">Connecting&hellip;</div>
          <div *ngFor="let n of [1, 2, 3, 4, 5, 6]" class="h-40 animate-pulse rounded-xl bg-slate-900 ring-1 ring-white/5"></div>
        </div>

        <ng-container *ngIf="snapshot">
          <div
            cdkDropList
            (cdkDropListDropped)="onDrop($event)"
            [cdkDropListDisabled]="!customizing"
            class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <div
              *ngFor="let id of layout"
              cdkDrag
              class="widget relative"
              [class.xl:col-span-3]="id === 'kpis'"
              [class.md:col-span-2]="id === 'kpis'"
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

              <div *ngIf="customizing" cdkDragHandle class="mb-1 cursor-move text-center text-xs text-slate-500">&#8942;&#8942; drag &#8942;&#8942;</div>

              @switch (id) {
                @case ('kpis') {
                  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <app-kpi-tile label="Total Predictions" [value]="fmt(snapshot.kpis.totalPredictions)"></app-kpi-tile>
                    <app-kpi-tile label="Model Accuracy" [value]="snapshot.kpis.modelAccuracy + '%'"></app-kpi-tile>
                    <app-kpi-tile label="Data Points" [value]="fmt(snapshot.kpis.dataPoints)"></app-kpi-tile>
                    <app-kpi-tile label="Active Models" [value]="'' + snapshot.kpis.activeModels"></app-kpi-tile>
                  </div>
                }
                @case ('trend') {
                  <app-accuracy-trend-chart [points]="snapshot.accuracyTrend"></app-accuracy-trend-chart>
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

          <div *ngIf="customizing && layoutSvc.available().length" class="mt-6 rounded-xl bg-slate-900 p-4 ring-1 ring-white/5">
            <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Add widget</h3>
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let id of layoutSvc.available()"
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm text-slate-200 ring-1 ring-white/10 hover:bg-white/5"
                (click)="addWidget(id)"
              >
                + {{ id }}
              </button>
            </div>
          </div>
        </ng-container>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  snapshot: MetricsSnapshot | null = null;
  connected = false;
  customizing = false;
  isLightTheme = false;
  layout: WidgetId[] = [];

  fmt = formatCompact;

  private subs = new Subscription();

  constructor(
    public socket: MetricsSocketService,
    public theme: ThemeService,
    private auth: AuthService,
    public layoutSvc: WidgetLayoutService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.layout = this.layoutSvc.getLayout();

    this.socket.connect();
    this.subs.add(this.socket.snapshots$.subscribe((snap) => (this.snapshot = snap)));
    this.subs.add(this.socket.connected$.subscribe((c) => (this.connected = c)));
    this.subs.add(this.theme.theme$.subscribe((t) => (this.isLightTheme = t === 'light')));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.socket.disconnect();
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

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
