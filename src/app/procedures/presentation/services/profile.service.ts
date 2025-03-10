import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { Account } from '../../../administration/domain';
import { environment } from '../../../../environments/environment';
import { account, AccountMapper } from '../../../administration/infrastructure';
import { AuthService } from '../../../presentation/services';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly url = `${environment.base_url}/assignation`;
  private user = inject(AuthService).user;

  private http = inject(HttpClient);

  private _account = signal<Account | null>(null);
  account = computed(() => this._account());
  constructor() {
    effect(() => {});
  }

  checkAccount(): Observable<boolean> {
    return this.http.get<account>(this.url).pipe(
      tap((resp) => this._account.set(AccountMapper.fromResponse(resp))),
      map(() => true),
      catchError(() => of(false))
    );
  }
}
