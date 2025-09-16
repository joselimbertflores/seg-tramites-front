import { Routes } from '@angular/router';

import { reportPermissionGuard, reportsRedirectGuard } from './guards';
import { resourceGuard } from '../../auth/presentation/guards';

export const ReportRoutes: Routes = [
  {
    path: 'reports',
    title: 'Reportes',
    canActivate: [resourceGuard],
    loadComponent: () => import('./layouts/report-dashboard/report-dashboard.component'),
    children: [
      {
        path: 'home',
        canActivate: [reportsRedirectGuard],
        loadComponent: () => import('./pages/report-home/report-home.component'),
      },
      {
        path: 'applicant',
        data: { action: 'applicant' },
        canActivate: [reportPermissionGuard],
        loadComponent: () => import('./pages/report-applicant/report-applicant.component'),
      },
      {
        path: 'search',
        data: { action: 'search' },
        canActivate: [reportPermissionGuard],
        loadComponent: () => import('./pages/report-search/report-search.component'),
      },
      {
        path: 'unit',
        data: { action: 'unit' },
        canActivate: [reportPermissionGuard],
        loadComponent: () => import('./pages/report-unit/report-unit.component'),
      },
      {
        path: 'segments',
        data: { action: 'segments' },
        canActivate: [reportPermissionGuard],
        loadComponent: () => import('./pages/report-segments/report-segments.component'),
      },
      {
        path: 'history',
        data: { action: 'history' },
        canActivate: [reportPermissionGuard],
        loadComponent: () => import('./pages/report-history-communication/report-history-communication.component'),
      },
      {
        path: 'unlink',
        data: { action: 'unlink' },
        canActivate: [reportPermissionGuard],
        loadComponent: () => import('./pages/report-unlink/report-unlink.component'),
      },
      {
        path: 'efficiency',
        data: { action: 'efficiency' },
        canActivate: [reportPermissionGuard],
        loadComponent: () => import('./pages/report-efficiency/report-efficiency.component'),
      },
      {
        path: 'correspondence-status',
        data: { action: 'unit_correspondence_status' },
        canActivate: [reportPermissionGuard],
        loadComponent: () => import( './pages/report-unit-correspondence-status/report-unit-correspondence-status.component'),
      },
      {
        path: 'detail/:group/:id',
        data: { animation: 'slide' },
        loadComponent: () => import('../../procedures/presentation/pages/detail/detail.component'),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];
