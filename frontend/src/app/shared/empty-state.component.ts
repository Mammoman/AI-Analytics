import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-16 px-4">
      <div class="h-12 w-12 rounded-full bg-slate-100 dark:bg-white/5 grid place-items-center">
        <svg
          viewBox="0 0 24 24"
          class="h-6 w-6 text-slate-400 dark:text-slate-500"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          @switch (icon) {
            @case ('chart') {
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18M8 17V10m5 7V7m5 10v-4" />
            }
            @case ('document') {
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12h6m-6 4h6m1 5H8a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            }
            @case ('bell') {
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            }
            @default {
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 7l1.5-3h15L21 7m-18 0v11a2 2 0 002 2h14a2 2 0 002-2V7m-18 0h18M9 12h6"
              />
            }
          }
        </svg>
      </div>

      <h3 class="mt-4 text-slate-900 dark:text-white font-semibold">{{ title }}</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm">{{ message }}</p>

      <div class="mt-5">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon: 'inbox' | 'chart' | 'document' | 'bell' = 'inbox';
  @Input() title = '';
  @Input() message = '';
}
