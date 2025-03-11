import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
// import { AuthService } from '../services';

export const updatedPasswordGuard: CanActivateFn = (route, state) => {
  // const authService = inject(AuthService);
  // const router = inject(Router);
  // if (!authService.updatedPassword()) {
  //   router.navigateByUrl('/home/settings');
  //   return false;
  // }
  return true;
};
