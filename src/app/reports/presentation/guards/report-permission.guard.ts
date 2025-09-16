import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { AuthService } from '../../../auth/presentation/services/auth.service';
import { validResource } from '../../../auth/infrastructure';

export const reportPermissionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const action = route.data['action'] as string;
  if (!action) return true;

  const hasPermission = authService.hasPermission( validResource.reports, action);

  if (!hasPermission) {
    router.navigateByUrl('/home/reports/home');
    return false;
  }
  return true;
};
