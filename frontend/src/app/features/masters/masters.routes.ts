import { Routes } from '@angular/router';

export const mastersRoutes: Routes = [
  {
    path: 'customers',
    loadComponent: () => import('./customer-list/customer-list.component').then(m => m.CustomerListComponent)
  },
  {
    path: 'contacts',
    loadComponent: () => import('./contact-list/contact-list.component').then(m => m.ContactListComponent)
  },
  {
    path: 'employees',
    loadComponent: () => import('./employee-list/employee-list.component').then(m => m.EmployeeListComponent)
  },
  { path: '', redirectTo: 'customers', pathMatch: 'full' }
];
