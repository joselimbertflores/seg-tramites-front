import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map } from 'rxjs';

import { ProfileService } from '../../../procedures/presentation/services';

export const accountGuard: CanActivateFn = () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.checkAccount().pipe(
    map((isValid) => isValid || router.parseUrl('/home/main')),
  );
};
