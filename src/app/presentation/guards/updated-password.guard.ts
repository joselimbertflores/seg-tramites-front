import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { AuthService } from '../../auth/presentation/services/auth.service';

export const updatedPasswordGuard: CanActivateFn = (route, state) => {
   const authService = inject(AuthService);
  const router = inject(Router);
  console.log("home/settings");
  const url = state.url;
  if (!authService.updatedPassword() && !url.includes('/home/settings')) {
    router.navigateByUrl('/home/settings');
    return false;
  }
  return true;
};  
