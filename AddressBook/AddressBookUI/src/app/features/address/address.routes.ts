import type { Routes } from '@angular/router';

export const ADDRESS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'create' },
  {
    path: 'create',
    title: 'Add an address',
    loadComponent: () =>
      import('./feature/address-form/address-form').then((m) => m.AddressForm),
  },
  {
    path: 'address/:id',
    title: 'Address details',
    loadComponent: () =>
      import('./feature/address-detail/address-detail').then((m) => m.AddressDetail),
  },
];
