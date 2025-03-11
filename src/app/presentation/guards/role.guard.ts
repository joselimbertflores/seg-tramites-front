import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
// import { AuthService } from '../services';
// import { VALID_RESOURCES } from '../../infraestructure/interfaces';

export const roleGuard: CanActivateFn = (route) => {
  // const authService = inject(AuthService);
  // const router = inject(Router);
  // const resource: VALID_RESOURCES | undefined = route.data['resource'];
  // if (!resource) return true;
  // const hasPermission = authService.permissions()[resource];
  // if (hasPermission) return true;
  // router.navigate(['/']);
  return false;
};
