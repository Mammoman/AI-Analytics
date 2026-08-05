import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../auth/auth.service';

type IconName = 'dashboard' | 'predictions' | 'alerts' | 'reports' | 'settings';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      <!-- Mobile backdrop -->
      <div
        *ngIf="sidebarOpen"
        class="fixed inset-0 z-30 bg-black/50 lg:hidden"
        (click)="sidebarOpen = false"
        aria-hidden="true"
      ></div>

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-white/5 dark:bg-slate-900 lg:static lg:z-auto lg:w-60 lg:translate-x-0"
        [class.translate-x-0]="sidebarOpen"
      >
        <div class="flex items-center gap-2 px-4 py-4">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5">
              <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
            </svg>
          </span>
          <span class="text-base font-bold tracking-tight text-slate-900 dark:text-white">Aetherium</span>
        </div>

        <nav class="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.path"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            (click)="sidebarOpen = false"
          >
            <span class="h-5 w-5 shrink-0">
              @switch (item.icon) {
                @case ('dashboard') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                @case ('predictions') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18M7 14l4-4 3 3 5-6" />
                  </svg>
                }
                @case ('alerts') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                }
                @case ('reports') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                @case ('settings') {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              }
            </span>
            <span>{{ item.label }}</span>
          </a>
        </nav>
      </aside>

      <!-- Main column -->
      <div class="flex min-w-0 flex-1 flex-col">
        <header
          class="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur dark:border-white/5 dark:bg-slate-950/90 sm:px-4"
        >
          <button
            type="button"
            class="rounded-lg p-2 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/5 lg:hidden"
            (click)="sidebarOpen = !sidebarOpen"
            aria-label="Toggle navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex-1"></div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg p-2 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/5"
              (click)="theme.toggle()"
              aria-label="Toggle theme"
            >
              <span *ngIf="!isLightTheme">🌙</span>
              <span *ngIf="isLightTheme">☀️</span>
            </button>

            <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-medium text-rose-500 ring-1 ring-slate-200 hover:bg-rose-500/10 dark:text-rose-300 dark:ring-white/10"
              (click)="signOut()"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  sidebarOpen = false;
  isLightTheme = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/app/dashboard', icon: 'dashboard' },
    { label: 'Predictions', path: '/app/predictions', icon: 'predictions' },
    { label: 'Alerts', path: '/app/alerts', icon: 'alerts' },
    { label: 'Reports', path: '/app/reports', icon: 'reports' },
    { label: 'Settings', path: '/app/settings', icon: 'settings' },
  ];

  constructor(public theme: ThemeService, private auth: AuthService, private router: Router) {
    this.theme.theme$.subscribe((t) => (this.isLightTheme = t === 'light'));
  }

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
