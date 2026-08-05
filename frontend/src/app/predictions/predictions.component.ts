import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  template: `
    <div class="p-4 sm:p-6">
      <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Predictions</h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Model forecasts and inference insights</p>

      <div class="mt-4 w-full min-w-0 rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5">
        <app-empty-state
          icon="chart"
          title="Coming soon"
          message="Model forecasts, confidence intervals, and inference-level breakdowns will live here so you can trace predictions back to the data that drove them."
        >
          <a
            routerLink="/app/dashboard"
            class="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
          >
            Back to dashboard
          </a>
        </app-empty-state>
      </div>
    </div>
  `,
})
export class PredictionsComponent {}
