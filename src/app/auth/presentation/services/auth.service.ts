import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  JwtPayload,
  VALID_RESOURCES,
  account,
  menu,
} from '../../../infraestructure/interfaces';
import { Account } from '../../../domain/models';

interface loginProps {
  login: string;
  password: string;
  remember: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly base_url: string = environment.base_url;
  private _account = signal<JwtPayload | null>(null);
  private _menu = signal<menu[]>([]);
  private _code = signal<string>('');
  private _permissions = signal<Record<VALID_RESOURCES, string[]> | null>(null);
  private _updatedPassword = signal<boolean>(false);

  public user = computed(() => this._account());
  public menu = computed(() => this._menu());
  public code = computed(() => this._code());
  public permissions = computed(() => this._permissions()!);
  public updatedPassword = computed(() => this._updatedPassword());

  constructor(private http: HttpClient) {}

  login({ login, password, remember }: loginProps) {
    if (remember) {
      localStorage.setItem('login', login);
    } else {
      localStorage.removeItem('login');
    }
    return this.http
      .post<{ token: string }>(`${this.base_url}/auth`, {
        login,
        password,
      })
      .pipe(map(({ token }) => this._setAuthentication(token)));
  }

  logout() {
    localStorage.removeItem('token');
    this._account.set(null);
    this._permissions.set(null);
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }
    return this.http
      .get<{
        token: string;
        code: string;
        menu: menu[];
        permissions: Record<VALID_RESOURCES, string[]>;
        updatedPassword: boolean;
      }>(`${this.base_url}/auth`)
      .pipe(
        tap((resp) => console.log(resp)),
        map(({ menu, token, code, permissions, updatedPassword }) => {
          this._menu.set(menu);
          this._code.set(code);
          this._permissions.set(permissions);
          this._updatedPassword.set(updatedPassword);
          return this._setAuthentication(token);
        }),
        catchError(() => {
          this.logout();
          return of(false);
        })
      );
  }


  updateMyAccount(password: string) {
    return this.http
      .put<{ message: string }>(`${this.base_url}/auth`, {
        password,
      })
      .pipe(tap(() => this._updatedPassword.set(true)));
  }

  private _setAuthentication(token: string): boolean {
    this._account.set(jwtDecode(token));
    localStorage.setItem('token', token);
    return true;
  }
}
