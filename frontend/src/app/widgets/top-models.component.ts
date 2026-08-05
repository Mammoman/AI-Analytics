import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopModel } from '../core/metrics.model';

@Component({
  selector: 'app-top-models',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full min-w-0 rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 p-4">
      <h3 class="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Top Models</h3>
      <ol class="flex flex-col divide-y divide-slate-200 dark:divide-white/5 overflow-x-auto">
        <li *ngFor="let model of models; let i = index" class="flex items-center gap-2 sm:gap-3 py-2 text-sm min-w-0">
          <span class="shrink-0 text-slate-500 dark:text-slate-500 w-5 text-right">{{ i + 1 }}</span>
          <span class="min-w-0 flex-1 text-slate-700 dark:text-slate-200 truncate">{{ model.name }}</span>
          <span class="shrink-0 text-slate-900 dark:text-white font-medium">{{ model.score }}</span>
          <span
            class="shrink-0 flex items-center gap-1 text-xs font-medium"
            [class.text-emerald-400]="model.delta >= 0"
            [class.text-rose-400]="model.delta < 0"
          >
            <span>{{ model.delta >= 0 ? '▲' : '▼' }}</span>
            <span>{{ (model.delta >= 0 ? '+' : '') + model.delta }}</span>
          </span>
        </li>
        <li *ngIf="!models.length" class="py-2 text-sm text-slate-500 dark:text-slate-500">No models</li>
      </ol>
    </div>
  `,
})
export class TopModelsComponent {
  @Input() models: TopModel[] = [];
}
