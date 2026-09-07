import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const updatedPasswordGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const url = state.url;
  if (authService.requiresPasswordChange() && !url.includes('/home/settings')) {
    return router.parseUrl('/home/settings');
  }
  return true;
};
