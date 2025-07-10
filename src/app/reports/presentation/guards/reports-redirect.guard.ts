import { inject } from '@angular/core';
import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';

import { ReportCacheService } from '../services';

export const reportsRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);

  const reportCacheService = inject(ReportCacheService);

  const lastReportPath = reportCacheService.lastReportPath();

  if (lastReportPath) {
    const redirectUrl = router.parseUrl(lastReportPath);
    return new RedirectCommand(redirectUrl);
  }
  return true;
};
