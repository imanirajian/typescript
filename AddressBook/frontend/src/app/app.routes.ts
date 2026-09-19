import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // The whole address feature is one lazy chunk.
    path: '',
    loadChildren: () => import('./features/address/address.routes').then((m) => m.ADDRESS_ROUTES),
  },
  { path: '**', redirectTo: 'create' },
];
