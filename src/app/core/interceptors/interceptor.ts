import {
  HttpEvent,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { AuthService } from '../../presentation/services';
import { AlertService } from '../../shared';

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const alertService = inject(AlertService);

  const reqWithHeader = req.clone({
    headers: req.headers.append(
      'Authorization',
      `Bearer ${localStorage.getItem('token') || ''}`
    ),
  });

  if (req.headers.has('loader')) {
    alertService.showAppLoader();
  }

  return next(reqWithHeader).pipe(
    catchError((error) => {
      handleHttpErrors(error, alertService);
      return throwError(() => Error);
    }),
    finalize(() => {
      alertService.closeAppLoader();
    })
  );
}

const handleHttpErrors = (error: HttpErrorResponse, service: AlertService) => {
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
      // Alert.Alert({
      //   icon: 'warning',
      //   title: 'Recurso no econtrado',
      //   text: error.error.message,
      // });
      break;
    default:
      break;
  }
};
