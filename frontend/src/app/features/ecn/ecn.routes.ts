import { Routes } from '@angular/router';

export const ecnRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ecn-list/ecn-list.component').then(m => m.EcnListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./ecn-list/ecn-list.component').then(m => m.EcnListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./ecn-list/ecn-list.component').then(m => m.EcnListComponent)
  }
];
