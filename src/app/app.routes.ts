import { Routes } from '@angular/router';

import {
  isAuthenticatedGuard,
  isNotAuthenticatedGuard,
} from './presentation/guards';
import { ClientsComponent } from './presentation/pages/groupware/clients/clients.component';

import { InfoComponent } from './layout/presentation/pages/info/info.component';
import { accountGuard } from './administration/presentation/guards/account.guard';
import { permissionGuard } from './auth/presentation/guards';
import { reportPermissionGuard } from './reports/presentation/guards/report-permission.guard';
import { reportsRedirectGuard } from './reports/presentation/guards/reports-redirect.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Autentificacion',
    canActivate: [isNotAuthenticatedGuard],
    loadComponent: () =>
      import('./auth/presentation/pages/login/login.component'),
  },
  {
    path: 'home',
    title: 'Inicio',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () =>
      import('./layout/presentation/pages/home/home.component'),
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      {
        path: 'usuarios',
        title: 'Usuarios',
        loadComponent: () =>
          import(
            './users/presentation/pages/users-manage/users-manage.component'
          ),
      },
      {
        path: 'roles',
        title: 'Roles',
        loadComponent: () =>
          import(
            './users/presentation/pages/roles-manage/roles-manage.component'
          ),
      },
      {
        path: 'institutions',
        title: 'Instituciones',
        loadComponent: () =>
          import(
            './administration/presentation/pages/institutions-manage/institutions-manage.component'
          ),
      },

      {
        title: 'Funcionarios',
        path: 'officers',
        loadComponent: () =>
          import(
            './administration/presentation/pages/officers-manage/officers-manage.component'
          ),
      },

      {
        path: 'dependencies',
        title: 'Dependencias',
        loadComponent: () =>
          import(
            './administration/presentation/pages/dependencies-manage/dependencies-manage.component'
          ),
      },
      {
        path: 'accounts',
        title: 'Cuentas',
        loadComponent: () =>
          import(
            './administration/presentation/pages/accounts-manage/accounts-manage.component'
          ),
      },
      {
        path: 'types-procedures',
        loadComponent: () =>
          import(
            './administration/presentation/pages/types-procedures/types-procedures.component'
          ),
      },
      {
        path: 'manage',
        canActivate: [isAuthenticatedGuard, accountGuard],
        children: [
          {
            path: 'external',
            data: { animation: 'ExternalPage' },
            loadComponent: () =>
              import(
                './procedures/presentation/pages/externals-manage/externals-manage.component'
              ),
          },
          {
            path: 'internal',
            data: { animation: 'InternalPage' },
            loadComponent: () =>
              import(
                './procedures/presentation/pages/internals-manage/internals-manage.component'
              ),
          },
          {
            path: 'procurement',
            data: { animation: 'ProcurementPage' },
            loadComponent: () =>
              import(
                './procedures/presentation/pages/procurements-manage/procurements-manage.component'
              ),
          },
          {
            path: 'inbox',
            title: 'Bandeja de entrada',
            data: { animation: 'InboxPage' },
            loadComponent: () =>
              import(
                './communications/presentation/pages/inbox/inbox.component'
              ),
          },
          {
            path: 'inbox/:id',
            title: 'Detalle',
            data: { animation: 'slide' },
            loadComponent: () =>
              import(
                './communications/presentation/pages/inbox-detail/inbox-detail.component'
              ),
          },
          {
            path: 'outbox',
            title: 'Bandeja - Salida',
            data: { animation: 'OutboxPage' },
            loadComponent: () =>
              import(
                './communications/presentation/pages/outbox/outbox.component'
              ),
          },
          {
            path: 'folders',
            data: { animation: 'FoldersPage' },
            loadComponent: () =>
              import(
                './communications/presentation/pages/folders/folders.component'
              ),
          },
          {
            path: 'folders/:id',
            data: { animation: 'ArchivePage' },
            loadComponent: () =>
              import(
                './communications/presentation/pages/archives/archives.component'
              ),
          },
          {
            path: ':from/:group/:id',
            title: 'Detalle',
            data: { animation: 'slide' },
            loadComponent: () =>
              import('./procedures/presentation/pages/detail/detail.component'),
          },
        ],
      },
      {
        path: 'resources',
        title: 'Recursos',
        data: { animation: 'ResourcesPage' },
        loadComponent: () =>
          import(
            './resources/presentation/pages/resources/resources.component'
          ),
      },
      {
        path: 'reports',
        title: "Reportes",
        canActivate: [permissionGuard],
        loadComponent: () => import('./reports/presentation/layouts/report-dashboard/report-dashboard.component'),
        children: [
          {
            path: 'home',
            canActivate: [reportsRedirectGuard],
            loadComponent: () => import('./reports/presentation/pages/report-home/report-home.component'),
          },
          {
            path: 'applicant',
            data: { action: 'applicant' },
            canActivate: [reportPermissionGuard],
            loadComponent: () => import('./reports/presentation/pages/report-applicant/report-applicant.component'),
          },
          {
            path: 'search',
            data: { action: 'search' },
            canActivate: [reportPermissionGuard],
            loadComponent: () => import('./reports/presentation/pages/report-search/report-search.component'),
          },
          {
            path: 'unit',
            data: { action: 'unit' },
            canActivate: [reportPermissionGuard],
            loadComponent: () => import('./reports/presentation/pages/report-unit/report-unit.component'),
          },
          {
            path: 'segments',
            data: { action: 'segments' },
            canActivate: [reportPermissionGuard],
            loadComponent: () => import('./reports/presentation/pages/report-segments/report-segments.component'),
          },
          {
            path: 'history',
            data: { action: 'history' },
            canActivate: [reportPermissionGuard],  
            loadComponent: () => import( './reports/presentation/pages/report-history-communication/report-history-communication.component'),
          },
          {
            path: 'unlink',
            data: { action: 'unit' },
            canActivate: [reportPermissionGuard],
            loadComponent: () => import('./reports/presentation/pages/report-unlink/report-unlink.component'),
          },
            {
            path: 'efficiency',
            data: { action: 'efficiency' },
            canActivate: [reportPermissionGuard],
            loadComponent: () => import('./reports/presentation/pages/report-efficiency/report-efficiency.component'),
          },
          {
            path: 'detail/:group/:id',
            data: { animation: 'slide' },
            loadComponent: () => import('./procedures/presentation/pages/detail/detail.component'),
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' },
        ],
      },
      {
        path: 'groupware',
        data: { resource: 'groupware' },
        children: [
          {
            path: 'users',
            component: ClientsComponent,
          },
        ],
      },
      {
        path: 'posts/history',
        loadComponent: () =>
          import(
            './publications/presentation/pages/publication-history/publication-history.component'
          ),
      },
      {
        path: 'posts/manage',
        loadComponent: () =>
          import(
            './publications/presentation/pages/publications-manage/publications-manage.component'
          ),
      },
      {
        path: 'main',
        loadComponent: () =>
          import('./layout/presentation/pages/main/main.component'),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./layout/presentation/pages/settings/settings.component'),
      },
      {
        path: 'info',
        component: InfoComponent,
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
