import { Routes } from '@angular/router';

export const apqpRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./apqp-board/apqp-board.component').then(m => m.ApqpBoardComponent)
  }
];
