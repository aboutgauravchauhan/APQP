import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadChildren: () => import('./features/projects/projects.routes').then(m => m.projectRoutes)
      },
      {
        path: 'bom',
        loadChildren: () => import('./features/bom/bom.routes').then(m => m.bomRoutes)
      },
      {
        path: 'apqp',
        loadChildren: () => import('./features/apqp/apqp.routes').then(m => m.apqpRoutes)
      },
      {
        path: 'ecn',
        loadChildren: () => import('./features/ecn/ecn.routes').then(m => m.ecnRoutes)
      },
      {
        path: 'ppap',
        loadChildren: () => import('./features/ppap/ppap.routes').then(m => m.ppapRoutes)
      },
      {
        path: 'vendors',
        loadChildren: () => import('./features/vendors/vendors.routes').then(m => m.vendorRoutes)
      },
      {
        path: 'masters',
        loadChildren: () => import('./features/masters/masters.routes').then(m => m.mastersRoutes)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.settingsRoutes)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
