import {
  HttpEvent,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpContextToken,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { AlertService, LoadingService } from '../../shared';

export const LOAD_INDICATOR = new HttpContextToken<boolean>(() => true);
export const UPLOAD_INDICATOR = new HttpContextToken<boolean>(() => true);

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const alertService = inject(AlertService);
  const loadingService = inject(LoadingService);

  const isModifying = req.method !== 'GET';
  const showLoadIndicator = req.context.get(LOAD_INDICATOR) && !isModifying;
  const showUploadIndicator = req.context.get(UPLOAD_INDICATOR) && isModifying;

  if (showLoadIndicator) {
    loadingService.toggleLoading(true);
  } else {
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
      handleHttpErrorMessages(error, alertService);
      return throwError(() => error);
    }),
    finalize(() => {
      if (showLoadIndicator) loadingService.toggleLoading(false);
      if (showUploadIndicator) loadingService.toggleUploading(false);
    })
  );
}

const handleHttpErrorMessages = (
  error: HttpErrorResponse,
  service: AlertService
) => {
  // const authService = inject(AuthService);
  // const router = inject(Router);
  const message: string = error.error['message'] ?? 'Error no controlado';
  switch (error.status) {
    case 500:
      service.showToast({ type: 'error', title: 'Ha ocurrido un error' });
      break;
    case 401:
      // authService.logout();
      // router.navigate(['/login']);
      break;
    case 400:
      service.showToast({
        type: 'warning',
        title: 'Solictud incorrecta',
        message,
      });
      break;
    case 403:
      // Alert.Alert({
      //   icon: 'info',
      //   title: 'Accesso denegado',
      //   text: 'Esta cuenta no tiene los permisos requeridos',
      // });
      break;
    case 404:
      service.showToast({
        type: 'warning',
        title: 'Solictud incorrecta',
        message,
      });
      break;
    default:
      break;
  }
  throw error;
};
