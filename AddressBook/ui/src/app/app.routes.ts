// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'create', pathMatch: 'full' },
    {
        path: 'create',
        loadComponent: () =>
            import('./features/address/address-create/address-create').then((m) => m.AddressCreate),
        title: 'Create Address'
    },
    {
        path: 'address/:id',
        loadComponent: () =>
            import('./features/address/address-detail/address-detail').then((m) => m.AddressDetail),
        title: 'Address Details'
    },
    { path: '**', redirectTo: 'create' }
];