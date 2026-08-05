import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { Prediction } from '../core/metrics.model';
import { PredictionsService } from '../core/predictions.service';
import { CHART_SCHEME } from '../widgets/chart-scheme';

type SortKey = 'model' | 'horizon' | 'predicted' | 'confidence' | 'trend' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const HORIZON_ORDER: Record<string, number> = { '1h': 0, '6h': 1, '24h': 2 };

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  template: `
    <div class="p-4 sm:p-6">
      <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Predictions</h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Model forecasts and inference confidence</p>

      <!-- Filter bar -->
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          Model
          <select
            [(ngModel)]="modelFilter"
            class="rounded-lg border-0 bg-white px-2.5 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-900 dark:text-slate-100 dark:ring-white/10"
          >
            <option value="">All</option>
            <option *ngFor="let m of models" [value]="m">{{ m }}</option>
          </select>
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          Horizon
          <select
            [(ngModel)]="horizonFilter"
            class="rounded-lg border-0 bg-white px-2.5 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-900 dark:text-slate-100 dark:ring-white/10"
          >
            <option value="">All</option>
            <option *ngFor="let h of horizons" [value]="h">{{ h }}</option>
          </select>
        </label>
      </div>

      <!-- Forecast chart -->
      <div class="mt-4 w-full min-w-0 rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 p-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
          Predicted Accuracy by Horizon
        </h3>
        <div class="h-64 w-full">
          <ngx-charts-line-chart
            [results]="chartData"
            [scheme]="scheme"
            [xAxis]="true"
            [yAxis]="true"
            [gradient]="false"
            [autoScale]="true"
            [legend]="true"
          ></ngx-charts-line-chart>
        </div>
      </div>

      <!-- Forecast table -->
      <div class="mt-4 w-full min-w-0 rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 p-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-3">
          Forecast Table
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                <th class="cursor-pointer select-none py-2 pr-4" (click)="setSort('model')">
                  Model {{ sortIndicator('model') }}
                </th>
                <th class="cursor-pointer select-none py-2 pr-4" (click)="setSort('horizon')">
                  Horizon {{ sortIndicator('horizon') }}
                </th>
                <th class="cursor-pointer select-none py-2 pr-4" (click)="setSort('predicted')">
                  Predicted (%) {{ sortIndicator('predicted') }}
                </th>
                <th class="cursor-pointer select-none py-2 pr-4" (click)="setSort('confidence')">
                  Confidence (%) {{ sortIndicator('confidence') }}
                </th>
                <th class="cursor-pointer select-none py-2 pr-4" (click)="setSort('trend')">
                  Trend {{ sortIndicator('trend') }}
                </th>
                <th class="cursor-pointer select-none py-2 pr-4" (click)="setSort('updatedAt')">
                  Updated {{ sortIndicator('updatedAt') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let row of sortedRows"
                class="border-b border-slate-100 last:border-0 dark:border-white/5"
              >
                <td class="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">{{ row.model }}</td>
                <td class="py-2 pr-4 text-slate-600 dark:text-slate-400">{{ row.horizon }}</td>
                <td class="py-2 pr-4 text-slate-900 dark:text-slate-100">{{ row.predicted }}</td>
                <td
                  class="py-2 pr-4 font-medium"
                  [class.text-emerald-600]="row.confidence >= 90"
                  [class.dark:text-emerald-400]="row.confidence >= 90"
                  [class.text-amber-600]="row.confidence >= 75 && row.confidence < 90"
                  [class.dark:text-amber-400]="row.confidence >= 75 && row.confidence < 90"
                  [class.text-rose-600]="row.confidence < 75"
                  [class.dark:text-rose-400]="row.confidence < 75"
                >
                  {{ row.confidence }}
                </td>
                <td class="py-2 pr-4">
                  <span
                    *ngIf="row.trend === 'up'"
                    class="text-emerald-600 dark:text-emerald-400"
                  >&#9650;</span>
                  <span
                    *ngIf="row.trend === 'down'"
                    class="text-rose-600 dark:text-rose-400"
                  >&#9660;</span>
                  <span
                    *ngIf="row.trend === 'flat'"
                    class="text-slate-500 dark:text-slate-400"
                  >&ndash;</span>
                </td>
                <td class="py-2 pr-4 text-slate-500 dark:text-slate-400">{{ relativeTime(row.updatedAt) }}</td>
              </tr>
              <tr *ngIf="sortedRows.length === 0">
                <td colspan="6" class="py-6 text-center text-slate-500 dark:text-slate-400">
                  No predictions match the current filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PredictionsComponent implements OnInit, OnDestroy {
  scheme = CHART_SCHEME;

  models = ['Model A', 'Model B', 'Model C', 'Model D'];
  horizons = ['1h', '6h', '24h'];

  modelFilter = '';
  horizonFilter = '';

  sortKey: SortKey = 'model';
  sortDir: SortDir = 'asc';

  rows: Prediction[] = [];

  private sub?: Subscription;
  private tickSub?: ReturnType<typeof setInterval>;
  private now = Date.now();

  constructor(private readonly predictionsService: PredictionsService) {
    this.rows = predictionsService.current();
  }

  ngOnInit(): void {
    this.sub = this.predictionsService.predictions$.subscribe((rows) => {
      this.rows = rows;
    });
    this.tickSub = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.tickSub !== undefined) {
      clearInterval(this.tickSub);
    }
  }

  get filteredRows(): Prediction[] {
    return this.rows.filter(
      (r) =>
        (this.modelFilter === '' || r.model === this.modelFilter) &&
        (this.horizonFilter === '' || r.horizon === this.horizonFilter),
    );
  }

  get sortedRows(): Prediction[] {
    const rows = [...this.filteredRows];
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;

    rows.sort((a, b) => {
      let cmp = 0;
      if (key === 'horizon') {
        cmp = HORIZON_ORDER[a.horizon] - HORIZON_ORDER[b.horizon];
      } else if (key === 'updatedAt') {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (typeof a[key] === 'number') {
        cmp = (a[key] as number) - (b[key] as number);
      } else {
        cmp = String(a[key]).localeCompare(String(b[key]));
      }
      return cmp * dir;
    });

    return rows;
  }

  setSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
  }

  sortIndicator(key: SortKey): string {
    if (this.sortKey !== key) return '';
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  relativeTime(iso: string): string {
    const seconds = Math.max(0, Math.floor((this.now - new Date(iso).getTime()) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  get chartData(): { name: string; series: { name: string; value: number }[] }[] {
    const modelsToShow = this.modelFilter ? [this.modelFilter] : this.models;
    return modelsToShow.map((model) => ({
      name: model,
      series: this.horizons.map((horizon) => {
        const row = this.rows.find((r) => r.model === model && r.horizon === horizon);
        return { name: horizon, value: row ? row.predicted : 0 };
      }),
    }));
  }
}
