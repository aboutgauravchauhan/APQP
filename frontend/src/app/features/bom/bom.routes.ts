import { Routes } from '@angular/router';

export const bomRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./bom-studio/bom-studio.component').then(m => m.BomStudioComponent)
  }
];
