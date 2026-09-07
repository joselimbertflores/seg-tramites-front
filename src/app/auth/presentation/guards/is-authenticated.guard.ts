import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const isAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.checkAuthStatus().pipe(
    map((isAuthenticated) => isAuthenticated || router.parseUrl('/login')),
    catchError(() => of(router.parseUrl('/login?error=session_unavailable'))),
  );
};
