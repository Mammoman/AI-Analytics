import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <div
        *ngFor="let t of toasts.toasts$ | async"
        class="flex items-start gap-3 rounded-lg border-l-4 bg-white px-4 py-3 text-sm text-slate-900 shadow-lg ring-1 ring-slate-200 transition-all animate-in fade-in slide-in-from-bottom-2 dark:bg-slate-800 dark:text-white dark:ring-white/10"
        [class.border-rose-500]="t.level === 'Critical'"
        [class.border-amber-500]="t.level === 'Warning'"
        [class.border-sky-500]="t.level === 'Info'"
        [class.border-emerald-500]="t.level === 'success'"
      >
        <span class="flex-1">{{ t.message }}</span>
        <button
          type="button"
          (click)="toasts.dismiss(t.id)"
          class="shrink-0 text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  `,
})
export class ToastContainerComponent {
  constructor(public toasts: ToastService) {}
}
