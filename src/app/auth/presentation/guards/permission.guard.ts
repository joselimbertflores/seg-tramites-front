import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { validResource } from '../../infrastructure';

export const permissionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const resource = route.data['resource'] as validResource;
  if (!resource) return true;
  const hasPermission = authService.hasResource(resource);
  if (!hasPermission) {
    router.navigateByUrl('home/unanthorize');
    return false;
  }
  return true;
};
