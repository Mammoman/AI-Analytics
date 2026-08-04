import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert } from '../core/metrics.model';

@Component({
  selector: 'app-recent-alerts-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl bg-slate-900 ring-1 ring-white/5 p-4">
      <h3 class="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Recent Alerts</h3>
      <div class="flex flex-col divide-y divide-white/5">
        <div *ngFor="let alert of alerts" class="flex items-center gap-3 py-2 text-sm">
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
            [ngClass]="{
              'bg-rose-500/20': alert.level === 'Critical',
              'text-rose-400': alert.level === 'Critical',
              'bg-amber-500/20': alert.level === 'Warning',
              'text-amber-400': alert.level === 'Warning',
              'bg-sky-500/20': alert.level === 'Info',
              'text-sky-400': alert.level === 'Info'
            }"
          >{{ alert.level }}</span>
          <span class="flex-1 text-slate-200 truncate">{{ alert.message }}</span>
          <span class="text-slate-500 text-xs">{{ alert.source }}</span>
          <span class="text-slate-300 text-xs font-medium">{{ alert.value }}</span>
        </div>
        <div *ngIf="!alerts.length" class="py-2 text-sm text-slate-500">No alerts</div>
      </div>
    </div>
  `,
})
export class RecentAlertsTableComponent {
  @Input() alerts: Alert[] = [];
}
