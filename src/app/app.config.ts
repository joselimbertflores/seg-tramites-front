import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';
import { routes } from './app.routes';
import { loggingInterceptor } from './core/interceptors/interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-BO';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([loggingInterceptor])),
    provideToastr(),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'es' },
    provideAnimationsAsync(),
    provideAnimationsAsync(),
  ],
};
