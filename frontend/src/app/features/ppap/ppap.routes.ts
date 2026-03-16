import { Routes } from '@angular/router';

export const ppapRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ppap-cockpit/ppap-cockpit.component').then(m => m.PpapCockpitComponent)
  }
];
