import { registerLocaleData } from '@angular/common';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';

import { provideAnimations } from '@angular/platform-browser/animations';
import localeEs from '@angular/common/locales/es-BO';
import { ApplicationConfig } from '@angular/core';

import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideToastr } from 'ngx-toastr';

import { loggingInterceptor } from './core/interceptors/interceptor';
import { routes } from './app.routes';
registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([loggingInterceptor])),
    provideAnimations(),
    provideToastr(),
    { provide: LOCALE_ID, useValue: 'es' },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
};
