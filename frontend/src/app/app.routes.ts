import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    // TODO(Task 7): add authGuard
    // canActivate: [() => import('./auth/auth.guard').then(m => m.authGuard)],
  },
  { path: '**', redirectTo: '' },
];
