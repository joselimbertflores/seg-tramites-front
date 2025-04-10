import { Routes } from '@angular/router';

import {
  isAuthenticatedGuard,
  isNotAuthenticatedGuard,
  roleGuard,
  updatedPasswordGuard,
} from './presentation/guards';
import { ClientsComponent } from './presentation/pages/groupware/clients/clients.component';

import { InfoComponent } from './layout/presentation/pages/info/info.component';
import { accountGuard } from './administration/presentation/guards/account.guard';

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
        loadComponent: () =>
          import('./layout/resources/resources.component').then(
            (c) => c.ResourcesComponent
          ),
      },
      {
        path: 'reports',
        canActivate: [updatedPasswordGuard],
        loadComponent: () =>
          import(
            './reports/presentation/layouts/report-dashboard/report-dashboard.component'
          ),
        children: [
          {
            path: 'applicant',
            loadComponent: () =>
              import(
                './reports/presentation/pages/report-applicant/report-applicant.component'
              ),
          },
          {
            path: 'search',
            loadComponent: () =>
              import(
                './reports/presentation/pages/report-search/report-search.component'
              ),
          },

          {
            path: ':group/:id',
            title: 'Detalle',
            data: { animation: 'slide' },
            loadComponent: () =>
              import('./procedures/presentation/pages/detail/detail.component'),
          },
          {
            path: '',
            loadComponent: () =>
              import(
                './reports/presentation/pages/landing-reports/landing-reports.component'
              ),
          },

          // {
          //   path: 'dependents',
          //   component: ReportDependentsComponent,
          // },
          // {
          //   path: 'unit',
          //   component: ReportUnitComponent,
          // },
          // {
          //   path: '',
          //   redirectTo: '/home/reports/search',
          //   pathMatch: 'full',
          // },
        ],
      },
      // {
      //   path: ':from/:group/:id',
      //   title: 'Detalle',
      //   data: { animation: 'slide' },
      //   loadComponent: () =>
      //     import('./procedures/presentation/pages/detail/detail.component'),
      // },
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
        path: 'posts',
        children: [
          {
            path: 'history',
            loadComponent: () =>
              import(
                './publications/presentation/pages/publication-history/publication-history.component'
              ),
          },
          {
            path: 'manage',
            loadComponent: () =>
              import(
                './publications/presentation/pages/manage-publications/manage-publications.component'
              ),
          },
        ],
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
