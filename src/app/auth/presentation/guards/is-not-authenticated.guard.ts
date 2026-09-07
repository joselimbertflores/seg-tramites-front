import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const isNotAuthenticatedGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (route.queryParamMap.has('error')) return true;
  return authService.checkAuthStatus().pipe(
    map((isAuthenticated) => isAuthenticated ? router.parseUrl('/home') : true),
    catchError(() => of(true)),
  );
};
