import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 px-4 text-center dark:bg-slate-950">
      <p class="text-7xl font-black tracking-tight text-cyan-500 dark:text-cyan-400 sm:text-8xl">404</p>
      <h1 class="mt-4 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">Page not found</h1>
      <p class="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        The page you're looking for doesn't exist or may have moved.
      </p>

      <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <a
          routerLink="/app/dashboard"
          class="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
        >
          Back to dashboard
        </a>
        <a
          routerLink="/"
          class="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          Return to home
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
