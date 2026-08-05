import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ThemeService } from '../core/theme.service';
import { SettingsService } from '../core/settings.service';
import { WidgetLayoutService } from '../dashboard/widget-layout.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-6">
      <div class="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Manage your preferences</p>
        </div>

        <!-- Appearance -->
        <section class="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/5 rounded-xl p-4 sm:p-6">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h2>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
              <p class="text-xs text-slate-500 dark:text-slate-400">Choose a light or dark interface.</p>
            </div>
            <div
              class="inline-flex rounded-lg ring-1 ring-slate-200 dark:ring-white/10 overflow-hidden self-start"
              role="group"
              aria-label="Theme"
            >
              <button
                type="button"
                (click)="setTheme('light')"
                [attr.aria-pressed]="(theme.theme$ | async) === 'light'"
                class="px-3 py-1.5 text-sm font-medium transition-colors"
                [class.bg-cyan-600]="(theme.theme$ | async) === 'light'"
                [class.text-white]="(theme.theme$ | async) === 'light'"
                [class.text-slate-600]="(theme.theme$ | async) !== 'light'"
                [class.dark:text-slate-300]="(theme.theme$ | async) !== 'light'"
              >
                Light
              </button>
              <button
                type="button"
                (click)="setTheme('dark')"
                [attr.aria-pressed]="(theme.theme$ | async) === 'dark'"
                class="px-3 py-1.5 text-sm font-medium transition-colors"
                [class.bg-cyan-600]="(theme.theme$ | async) === 'dark'"
                [class.text-white]="(theme.theme$ | async) === 'dark'"
                [class.text-slate-600]="(theme.theme$ | async) !== 'dark'"
                [class.dark:text-slate-300]="(theme.theme$ | async) !== 'dark'"
              >
                Dark
              </button>
            </div>
          </div>
        </section>

        <!-- Data -->
        <section class="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/5 rounded-xl p-4 sm:p-6">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Data</h2>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label for="refresh-interval" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Refresh interval
              </label>
              <p class="text-xs text-slate-500 dark:text-slate-400">Applies to the live data stream.</p>
            </div>
            <select
              id="refresh-interval"
              [ngModel]="refreshIntervalMs"
              (ngModelChange)="onRefreshIntervalChange($event)"
              class="rounded-lg border-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-1.5 px-3 ring-1 ring-slate-200 dark:ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 self-start"
            >
              <option [ngValue]="1000">1s</option>
              <option [ngValue]="1500">1.5s</option>
              <option [ngValue]="3000">3s</option>
              <option [ngValue]="5000">5s</option>
            </select>
          </div>
        </section>

        <!-- Notifications -->
        <section class="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/5 rounded-xl p-4 sm:p-6">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h2>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label for="notifications-toggle" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Critical alert notifications
              </label>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Show a toast when a new critical alert arrives.
              </p>
            </div>
            <button
              type="button"
              id="notifications-toggle"
              role="switch"
              [attr.aria-checked]="notificationsEnabled"
              (click)="onToggleNotifications()"
              class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors self-start"
              [class.bg-cyan-600]="notificationsEnabled"
              [class.bg-slate-300]="!notificationsEnabled"
              [class.dark:bg-slate-700]="!notificationsEnabled"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                [class.translate-x-6]="notificationsEnabled"
                [class.translate-x-1]="!notificationsEnabled"
              ></span>
            </button>
          </div>
        </section>

        <!-- Dashboard -->
        <section class="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/5 rounded-xl p-4 sm:p-6">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Dashboard</h2>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Widget layout</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Restore the default set of dashboard widgets.</p>
            </div>
            <div class="flex items-center gap-3 self-start">
              <button
                type="button"
                (click)="onResetLayout()"
                class="rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium py-1.5 px-3 ring-1 ring-slate-200 dark:ring-white/10 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Reset layout
              </button>
              @if (layoutResetConfirmed) {
                <span class="text-xs text-cyan-600 dark:text-cyan-400">Layout reset</span>
              }
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  layoutResetConfirmed = false;

  constructor(
    public theme: ThemeService,
    private settings: SettingsService,
    private layoutSvc: WidgetLayoutService,
  ) {}

  get refreshIntervalMs(): number {
    return this.settings.current.refreshIntervalMs;
  }

  get notificationsEnabled(): boolean {
    return this.settings.current.notificationsEnabled;
  }

  setTheme(target: 'light' | 'dark'): void {
    let current: 'light' | 'dark' = 'dark';
    this.theme.theme$.subscribe((t) => (current = t)).unsubscribe();
    if (current !== target) {
      this.theme.toggle();
    }
  }

  onRefreshIntervalChange(ms: number): void {
    this.settings.setRefreshInterval(Number(ms));
  }

  onToggleNotifications(): void {
    this.settings.setNotificationsEnabled(!this.notificationsEnabled);
  }

  onResetLayout(): void {
    this.layoutSvc.reset();
    this.layoutResetConfirmed = true;
    setTimeout(() => (this.layoutResetConfirmed = false), 3000);
  }
}
