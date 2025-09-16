import { inject } from '@angular/core';
import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';

import { ReportCacheService } from '../services';

export const reportsRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const defaultRoute = inject(ReportCacheService).currentReport()?.route;
  if (defaultRoute) {
    const redirectUrl = router.parseUrl(defaultRoute);
    return new RedirectCommand(redirectUrl);
  }
  return true;
};
