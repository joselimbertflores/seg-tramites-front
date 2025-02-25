import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { Account } from '../../domain';
import { environment } from '../../../../environments/environment';
import { account, AccountMapper } from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private readonly url = `${environment.base_url}/assignation`;

  private http = inject(HttpClient);

  private _account = signal<Account | null>(null);
  account = computed(() => this._account());

  checkAccount(): Observable<boolean> {
    return this.http.get<account>(this.url).pipe(
      tap((resp) => this._account.set(AccountMapper.fromResponse(resp))),
      map(() => true),
      catchError(() => {
        return of(false);
      })
    );
  }
}
