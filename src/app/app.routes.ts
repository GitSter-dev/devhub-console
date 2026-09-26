import { Routes } from '@angular/router';
import { adminGuard, guestGuard } from './auth/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cases' },
      {
        path: 'cases',
        loadComponent: () => import('./cases/case-list').then((m) => m.CaseListComponent),
      },
      {
        path: 'cases/:caseId',
        loadComponent: () => import('./cases/case-detail').then((m) => m.CaseDetailComponent),
      },
      {
        path: 'audit',
        loadComponent: () => import('./audit/audit-log').then((m) => m.AuditLogComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/user-search').then((m) => m.UserSearchComponent),
      },
      {
        path: 'users/:userId',
        loadComponent: () => import('./users/user-detail').then((m) => m.UserDetailComponent),
      },
      {
        path: 'stats',
        loadComponent: () => import('./stats/overview').then((m) => m.StatsOverviewComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
