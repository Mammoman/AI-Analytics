import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MetricsSocketService } from '../core/metrics-socket.service';
import { Alert } from '../core/metrics.model';
import { EmptyStateComponent } from '../shared/empty-state.component';

type AlertRow = Alert & { at: number };
type Filter = 'All' | Alert['level'];

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <div class="p-4 sm:p-6">
      <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Alerts</h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Live alert feed from all data sources</p>

      <!-- filter bar -->
      <div class="mt-4 flex flex-wrap items-center gap-1.5">
        @for (chip of chips; track chip.level) {
          <button
            type="button"
            (click)="activeFilter = chip.level"
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors"
            [ngClass]="chipClasses(chip.level)"
          >
            {{ chip.level }}
            <span
              class="inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold"
              [ngClass]="activeFilter === chip.level ? 'bg-black/10 dark:bg-white/10' : 'bg-slate-200 dark:bg-white/10'"
            >{{ countFor(chip.level) }}</span>
          </button>
        }
      </div>

      <!-- content -->
      <div class="mt-4 w-full min-w-0 rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 p-4">
        @if (!receivedFirst && alerts.length === 0) {
          <!-- loading skeleton -->
          <div class="flex flex-col divide-y divide-slate-200 dark:divide-white/5">
            @for (i of skeletonRows; track i) {
              <div class="flex items-center gap-3 py-3 animate-pulse">
                <div class="h-5 w-16 shrink-0 rounded-full bg-slate-200 dark:bg-white/10"></div>
                <div class="h-4 flex-1 rounded bg-slate-200 dark:bg-white/10"></div>
                <div class="hidden h-4 w-20 shrink-0 rounded bg-slate-200 dark:bg-white/10 sm:block"></div>
                <div class="h-4 w-12 shrink-0 rounded bg-slate-200 dark:bg-white/10"></div>
              </div>
            }
          </div>
        } @else if (filteredAlerts.length === 0) {
          <app-empty-state
            icon="bell"
            [title]="'No ' + (activeFilter === 'All' ? '' : activeFilter + ' ') + 'alerts'"
            message="Nothing to show for this filter right now."
          ></app-empty-state>
        } @else {
          <div class="flex flex-col divide-y divide-slate-200 dark:divide-white/5">
            @for (alert of filteredAlerts; track alert.at + alert.message) {
              <div class="flex flex-col gap-1.5 py-3 text-sm sm:flex-row sm:items-center sm:gap-3">
                <span
                  class="inline-flex w-fit shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  [ngClass]="{
                    'bg-rose-500/20 text-rose-500 dark:text-rose-400': alert.level === 'Critical',
                    'bg-amber-500/20 text-amber-600 dark:text-amber-400': alert.level === 'Warning',
                    'bg-sky-500/20 text-sky-600 dark:text-sky-400': alert.level === 'Info'
                  }"
                >{{ alert.level }}</span>
                <span class="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">{{ alert.message }}</span>
                <span class="shrink-0 font-mono text-xs text-slate-500 dark:text-slate-500">{{ alert.source }}</span>
                <span class="shrink-0 text-xs font-medium text-slate-600 dark:text-slate-300">{{ alert.value }}</span>
                <span class="shrink-0 text-xs text-slate-400 dark:text-slate-500">{{ relativeTime(alert.at) }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AlertsComponent implements OnInit, OnDestroy {
  readonly chips: { level: Filter }[] = [{ level: 'All' }, { level: 'Critical' }, { level: 'Warning' }, { level: 'Info' }];
  readonly skeletonRows = [0, 1, 2, 3, 4];

  alerts: AlertRow[] = [];
  activeFilter: Filter = 'All';
  receivedFirst = false;
  now = Date.now();

  private readonly maxAlerts = 50;
  private sub?: Subscription;
  private tickTimer?: ReturnType<typeof setInterval>;

  constructor(private socket: MetricsSocketService) {}

  ngOnInit(): void {
    this.sub = this.socket.snapshots$.subscribe((snapshot) => {
      this.receivedFirst = true;
      const stamped = snapshot.recentAlerts.map((a) => ({ ...a, at: Date.now() }));
      this.alerts = [...stamped, ...this.alerts].slice(0, this.maxAlerts);
    });
    this.socket.connect();

    this.tickTimer = setInterval(() => (this.now = Date.now()), 1000);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
    }
    // Intentionally NOT calling this.socket.disconnect() -- the socket is a
    // shared singleton also used by the dashboard; disconnecting here would
    // kill that stream too.
  }

  get filteredAlerts(): AlertRow[] {
    return this.activeFilter === 'All' ? this.alerts : this.alerts.filter((a) => a.level === this.activeFilter);
  }

  countFor(level: Filter): number {
    return level === 'All' ? this.alerts.length : this.alerts.filter((a) => a.level === level).length;
  }

  chipClasses(level: Filter): string {
    const active = this.activeFilter === level;
    if (!active) {
      return 'bg-transparent text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-white/10';
    }
    switch (level) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-rose-500/40';
      case 'Warning':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-amber-500/40';
      case 'Info':
        return 'bg-sky-500/20 text-sky-600 dark:text-sky-400 ring-sky-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 ring-cyan-500/40';
    }
  }

  relativeTime(at: number): string {
    const seconds = Math.max(0, Math.round((this.now - at) / 1000));
    if (seconds < 60) {
      return `${seconds}s ago`;
    }
    const minutes = Math.round(seconds / 60);
    return `${minutes}m ago`;
  }
}
