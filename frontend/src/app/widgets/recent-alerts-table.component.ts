import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert } from '../core/metrics.model';

@Component({
  selector: 'app-recent-alerts-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full min-w-0 rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 p-4">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h3 class="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">Recent Alerts</h3>
        <span
          *ngIf="criticalCount > 0"
          class="shrink-0 rounded-full bg-rose-500/20 text-rose-500 dark:text-rose-400 px-2 py-0.5 text-xs font-semibold"
        >{{ criticalCount }} Critical</span>
      </div>
      <div class="flex flex-wrap items-center gap-1.5 mb-2">
        <button
          *ngFor="let level of levels"
          type="button"
          (click)="selectedLevel = level"
          class="rounded-full px-2 py-0.5 text-xs font-medium ring-1 transition-colors"
          [ngClass]="selectedLevel === level
            ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 ring-cyan-500/40'
            : 'bg-transparent text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-white/10'"
        >{{ level }}</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-0 text-sm">
          <thead>
            <tr class="divide-x divide-transparent">
              <th scope="col" class="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">Level</th>
              <th scope="col" class="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">Message</th>
              <th scope="col" class="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">Source</th>
              <th scope="col" class="py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            <tr *ngFor="let alert of filteredAlerts">
              <td class="py-2 pr-2 align-middle">
                <span
                  class="inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  [ngClass]="{
                    'bg-rose-500/20': alert.level === 'Critical',
                    'text-rose-400': alert.level === 'Critical',
                    'bg-amber-500/20': alert.level === 'Warning',
                    'text-amber-400': alert.level === 'Warning',
                    'bg-sky-500/20': alert.level === 'Info',
                    'text-sky-400': alert.level === 'Info'
                  }"
                >{{ alert.level }}</span>
              </td>
              <td class="min-w-0 max-w-0 py-2 pr-2 text-slate-700 dark:text-slate-200">
                <span class="block truncate">{{ alert.message }}</span>
              </td>
              <td class="py-2 pr-2 text-xs text-slate-500 dark:text-slate-500">{{ alert.source }}</td>
              <td class="py-2 text-xs font-medium text-slate-600 dark:text-slate-300">{{ alert.value }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!filteredAlerts.length" class="py-2 text-sm text-slate-500 dark:text-slate-500">No alerts</div>
      </div>
    </div>
  `,
})
export class RecentAlertsTableComponent {
  @Input() alerts: Alert[] = [];

  readonly levels: ('All' | Alert['level'])[] = ['All', 'Critical', 'Warning', 'Info'];
  selectedLevel: 'All' | Alert['level'] = 'All';

  get filteredAlerts(): Alert[] {
    return this.selectedLevel === 'All'
      ? this.alerts
      : this.alerts.filter((a) => a.level === this.selectedLevel);
  }

  get criticalCount(): number {
    return this.alerts.filter((a) => a.level === 'Critical').length;
  }
}
