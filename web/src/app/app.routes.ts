import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'assets',
    loadComponent: () =>
      import('./pages/assets-list/assets-list.component').then(
        (m) => m.AssetsListComponent,
      ),
  },
  {
    path: 'assets/:id',
    loadComponent: () =>
      import('./pages/asset-detail/asset-detail.component').then(
        (m) => m.AssetDetailComponent,
      ),
  },
  {
    path: 'alerts',
    loadComponent: () =>
      import('./pages/alerts/alerts.component').then(
        (m) => m.AlertsComponent,
      ),
  },
];