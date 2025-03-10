import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { tap } from 'rxjs';

import { ProfileService } from '../../../procedures/presentation/services/profile.service';

export const accountGuard: CanActivateFn = (route, state) => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.checkAccount().pipe(
    tap((isValid) => {
      if (!isValid) router.navigateByUrl('/main');
    })
  );
};
