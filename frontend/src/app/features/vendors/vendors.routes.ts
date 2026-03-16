import { Routes } from '@angular/router';

export const vendorRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./vendor-list/vendor-list.component').then(m => m.VendorListComponent)
  }
];
