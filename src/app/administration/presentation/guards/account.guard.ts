import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { tap } from 'rxjs';

import { AssignmentService } from '../services/assignment.service';

export const accountGuard: CanActivateFn = (route, state) => {
  const profileService = inject(AssignmentService);
  const router = inject(Router);

  return profileService.checkAccount().pipe(
    tap((isValid) => {
      if (!isValid) router.navigateByUrl('/main');
    })
  );
};
