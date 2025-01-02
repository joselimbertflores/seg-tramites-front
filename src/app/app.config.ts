import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-BO';
import { ApplicationConfig } from '@angular/core';
import { LOCALE_ID } from '@angular/core';

import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { loggingInterceptor } from './core/interceptors/interceptor';
registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      }),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptors([loggingInterceptor])),
    provideAnimations(),
    provideToastr(),
    { provide: LOCALE_ID, useValue: 'es' },
    
  ],
};
