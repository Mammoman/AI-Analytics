import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
      <div class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl p-8">
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 text-center">Aetherium AI Analytics Platform</h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 text-center">Sign in to your dashboard</p>

        <form class="mt-6 space-y-4" (ngSubmit)="onSubmit()">
          <div>
            <label for="username" class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              [(ngModel)]="username"
              class="w-full rounded-md bg-white border border-slate-300 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label for="password" class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              [(ngModel)]="password"
              class="w-full rounded-md bg-white border border-slate-300 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          @if (error) {
            <p class="text-sm text-red-400">{{ error }}</p>
          }

          <button
            type="submit"
            class="w-full rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold py-2 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p class="mt-4 text-xs text-slate-500 dark:text-slate-500 text-center">Demo — any credentials work.</p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Auto-forward straight to the dashboard if already signed in.
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/app/dashboard']);
    }
  }

  onSubmit(): void {
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: () => (this.error = 'Sign in failed'),
    });
  }
}
