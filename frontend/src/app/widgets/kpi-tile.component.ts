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
      <svg
        *ngIf="history.length >= 2"
        class="mt-1 w-full h-7 text-cyan-500 dark:text-cyan-400"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          [attr.points]="sparkPoints"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>
  `,
})
export class KpiTileComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() delta?: string;
  @Input() history: number[] = [];

  get sparkPoints(): string {
    const n = this.history.length;
    if (n < 2) {
      return '';
    }
    const min = Math.min(...this.history);
    const max = Math.max(...this.history);
    const range = max - min;
    return this.history
      .map((v, i) => {
        const x = (i / (n - 1)) * 100;
        const y = range === 0 ? 50 : 100 - ((v - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  }
}
