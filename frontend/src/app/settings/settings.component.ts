import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="p-4 sm:p-6">
      <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Settings</h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">&hellip;</p>
    </div>
  `,
})
export class SettingsComponent {}
