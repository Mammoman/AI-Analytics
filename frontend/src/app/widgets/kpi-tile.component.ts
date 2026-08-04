import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-tile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 p-4 flex flex-col gap-1">
      <span class="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">{{ label }}</span>
      <span class="text-3xl font-semibold text-slate-900 dark:text-white">{{ value }}</span>
      <span
        *ngIf="delta"
        class="text-sm font-medium"
        [class.text-emerald-400]="delta.startsWith('+')"
        [class.text-rose-400]="!delta.startsWith('+')"
      >{{ delta }}</span>
    </div>
  `,
})
export class KpiTileComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() delta?: string;
}
