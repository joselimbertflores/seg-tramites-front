import { inject } from '@angular/core';
import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';

import { ReportCacheService } from '../services';

export const reportsRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);

  const reportCacheService = inject(ReportCacheService);

  const defaultRoutePath = reportCacheService.defaultRoute();
  const lastReportPath = reportCacheService.lastReportPath();

  if (defaultRoutePath) {
    const redirectUrl = router.parseUrl(defaultRoutePath);
    return new RedirectCommand(redirectUrl);
  }

  if (lastReportPath) {
    const redirectUrl = router.parseUrl(lastReportPath);
    return new RedirectCommand(redirectUrl);
  }
  return true;
};
