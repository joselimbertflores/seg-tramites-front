import {
  HttpEvent,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpContextToken,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, throwError } from 'rxjs';

import { LoadingService, ToastService } from '../../shared';

export const LOAD_INDICATOR = new HttpContextToken<boolean>(() => true);
export const UPLOAD_INDICATOR = new HttpContextToken<boolean>(() => true);

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const toastService = inject(ToastService);
  const loadingService = inject(LoadingService);

  const showLoadIndicator =
    req.context.get(LOAD_INDICATOR) && req.method === 'GET';
  const showUploadIndicator =
    req.context.get(UPLOAD_INDICATOR) && req.method !== 'GET';

  if (showLoadIndicator) {
    loadingService.toggleLoading(true);
  }

  if (showUploadIndicator) {
    loadingService.toggleUploading(true);
  }

  const reqWithHeader = req.clone({
    headers: req.headers.append(
      'Authorization',
      `Bearer ${localStorage.getItem('token') || ''}`
    ),
  });

  return next(reqWithHeader).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        const message: string = error.error['message'] ?? 'Error no controlado';
        switch (error.status) {
          case 500:
            toastService.showToast({
              severity: 'error',
              title: 'Ha ocurrido un error',
            });
            break;
          case 400:
            toastService.showToast({
              severity: 'warning',
              title: 'Solictud incorrecta',
              description: message,
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
          default:
            break;
        }
      }
      return throwError(() => error);
    }),
    finalize(() => {
      if (showLoadIndicator) loadingService.toggleLoading(false);
      if (showUploadIndicator) loadingService.toggleUploading(false);
    })
  );
}
