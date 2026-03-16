import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: 'permissions',
    loadComponent: () => import('./module-permissions/module-permissions.component').then(m => m.ModulePermissionsComponent)
  },
  { path: '', redirectTo: 'permissions', pathMatch: 'full' }
];
