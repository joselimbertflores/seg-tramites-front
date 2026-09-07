import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../auth/presentation/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly account = inject(AuthService).account;

  checkAccount(): Observable<boolean> {
    return of(this.account() !== null);
  }
}
