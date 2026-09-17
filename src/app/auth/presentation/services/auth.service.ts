import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AuthMethod, AuthSession, SessionUser, menu, validResource } from '../../infrastructure';
import { skipUploadIndicator } from '../../../helpers';
import { AccountMapper } from '../../../administration/infrastructure';
import { Account } from '../../../administration/domain';
import { SocketService } from '../../../layout/presentation/services/socket.service';
import { Router } from '@angular/router';

interface loginProps {
  login: string;
  password: string;
  remember: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base_url = environment.base_url;
  private readonly logoutChannel = new BroadcastChannel('seg-tramites-auth');
  private _user = signal<SessionUser | null>(null);
  private _menu = signal<menu[]>([]);
  private _permissions = signal<Partial<Record<validResource, string[]>>>({});
  private _authMethod = signal<AuthMethod | null>(null);
  private _updatedPassword = signal<boolean | null>(null);
  private _account = signal<Account | null>(null);

  readonly user = this._user.asReadonly();
  readonly menu = this._menu.asReadonly();
  readonly permissions = this._permissions.asReadonly();
  readonly authMethod = this._authMethod.asReadonly();
  readonly updatedPassword = this._updatedPassword.asReadonly();
  readonly account = this._account.asReadonly();
  readonly requiresPasswordChange = computed(() => this.authMethod() === 'LOCAL' && !this.updatedPassword());

  constructor(private http: HttpClient, private sockets: SocketService, private router: Router) {
    this.logoutChannel.onmessage = (event: MessageEvent) => {
      if (event.data?.type !== 'logout') return;
      this.clearSession();
      void this.router.navigateByUrl('/login');
    };
  }

  login({ login, password, remember }: loginProps) {
    if (remember) localStorage.setItem('login', login);
    else localStorage.removeItem('login');
    return this.http.post<AuthSession>(`${this.base_url}/auth`, { login, password }, {
      context: skipUploadIndicator(),
      withCredentials: true,
    }).pipe(map((session) => this.setAuthentication(session)));
  }

  loginWithIdentityHub(): void {
    const backend = new URL(this.base_url, window.location.origin);
    window.location.assign(new URL('/auth/login', backend).toString());
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base_url}/auth/logout`, {}, {
      withCredentials: true,
      context: skipUploadIndicator(),
    }).pipe(tap(() => {
      this.clearSession();
      this.logoutChannel.postMessage({ type: 'logout' });
    }));
  }

  clearSession(): void {
    this.sockets.disconnect();
    this._user.set(null);
    this._authMethod.set(null);
    this._account.set(null);
    this._permissions.set({});
    this._menu.set([]);
    this._updatedPassword.set(null);
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http.get<AuthSession>(`${this.base_url}/auth/me`, { withCredentials: true }).pipe(
      map((session) => this.setAuthentication(session)),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.clearSession();
          return of(false);
        }
        return throwError(() => error);
      }),
    );
  }

  updateMyUser(password: string) {
    return this.http.put<{ message: string }>(`${this.base_url}/auth`, { password }, { withCredentials: true })
      .pipe(tap(() => this._updatedPassword.set(true)));
  }

  hasPermission(resource: validResource, action: string[] | string): boolean {
    const entry = this.permissions()[resource];
    if (!entry) return false;
    const actions = Array.isArray(action) ? action : [action];
    return actions.some((action) => entry.includes(action));
  }

  private setAuthentication(session: AuthSession): boolean {
    this._user.set(session.user);
    this._authMethod.set(session.authMethod);
    this._menu.set(session.menu);
    this._permissions.set(session.permissions);
    this._account.set(session.account ? AccountMapper.fromResponse(session.account) : null);
    this._updatedPassword.set(session.authMethod === 'LOCAL' ? session.updatedPassword : null);
    return true;
  }
}
