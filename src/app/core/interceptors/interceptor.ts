import {
  HttpEvent,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, throwError } from 'rxjs';

import { LoadingService, ToastService } from '../../shared';
import { SHOW_PROGRESS_BAR, SHOW_UPLOAD_DIALOG } from './loading-context.token';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/presentation/services/auth.service';
import { environment } from '../../../environments/environment';

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const toastService = inject(ToastService);
  const loadingService = inject(LoadingService);
  const router = inject(Router);
  const authService = inject(AuthService);

  const load = req.method === 'GET' && req.context.get(SHOW_PROGRESS_BAR);
  const upload =
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    req.context.get(SHOW_UPLOAD_DIALOG);

  if (load) {
    loadingService.toggleLoading(true);
  }

  if (upload) {
    loadingService.toggleUploading(true);
  }

  const api = new URL(environment.base_url, window.location.origin);
  const url = new URL(req.url, window.location.origin);
  const isApi = url.origin === api.origin &&
    (url.pathname === api.pathname || url.pathname.startsWith(`${api.pathname}/`));
  const request = isApi ? req.clone({ withCredentials: true }) : req;

  return next(request).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        const message: string =
          typeof error.error?.['message'] === 'string'
            ? error.error['message']
            : 'No se pudo realizar la solicitud';

        switch (error.status) {
          case 500:
            toastService.showToast({
              severity: 'error',
              title: 'Error interno',
              description:
                'No se pudo procesar la solicitud. Por favor, vuelva a intentarlo más tarde.',
            });
            break;
          case 400:
            toastService.showToast({
              severity: 'warning',
              title: 'Solictud incorrecta',
              description: message,
            });
            break;
          case 0:
          case 502:
          case 503:
            toastService.showToast({
              severity: 'warning',
              title: 'Servicio temporalmente no disponible',
              description: 'No fue posible completar la solicitud. Intente nuevamente.',
            });
            break;
          case 403:
            toastService.showToast({
              severity: 'info',
              title: 'Acceso denegado',
              description: 'No tiene permiso para acceder a este recurso.',
            });
            break;
          case 404:
            toastService.showToast({
              severity: 'warning',
              title: 'Solictud incorrecta',
              description: message,
            });
            break;
          case 401:
            if (isApi) {
              authService.clearSession();
              if (url.pathname !== `${api.pathname}/auth/me`) router.navigate(['/login']);
            }
            break;
          default:
            break;
        }
      }
      return throwError(() => error);
    }),
    finalize(() => {
      if (load) loadingService.toggleLoading(false);
      if (upload) loadingService.toggleUploading(false);
    })
  );
}
