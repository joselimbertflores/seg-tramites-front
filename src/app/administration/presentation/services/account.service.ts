import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  account,
  dependency,
  institution,
  AccountMapper,
} from '../../infrastructure';
import { Account } from '../../domain';
import { role } from '../../../users/infrastructure';

interface FilterAccountsParams {
  limit: number;
  offset: number;
  term?: string;
  dependency?: string | null;
  institution?: string | null;
}

interface selectOption {
  value: string;
  label: string;
}

export interface IdentityCandidate {
  externalKey: string;
  fullName: string;
  email: string | null;
  login: string;
}

export interface CreateAccountRequest {
  dependencyId: string;
  jobtitle: string;
  employmentType: string | null;
  isVisible: boolean;
  roleId: string;
  assigneeExternalKey: string | null;
}

export type UpdateAccountRequest = Omit<
  CreateAccountRequest,
  'assigneeExternalKey'
> & {
  assigneeExternalKey?: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly URL = `${environment.base_url}/accounts`;
  private http = inject(HttpClient);

  getRoles(): Observable<selectOption[]> {
    return this.http
      .get<role[]>(`${this.URL}/roles`)
      .pipe(
        map((resp) =>
          resp.map(({ _id, name }) => ({ value: _id, label: name }))
        )
      );
  }

  getInstitutions(): Observable<selectOption[]> {
    return this.http
      .get<institution[]>(`${this.URL}/institutions`)
      .pipe(
        map((resp) =>
          resp.map(({ _id, nombre }) => ({ value: _id, label: nombre }))
        )
      );
  }

  getDependencies(institutionId: string): Observable<selectOption[]> {
    return this.http
      .get<dependency[]>(`${this.URL}/dependencies/${institutionId}`)
      .pipe(
        map((resp) =>
          resp.map(({ _id, nombre }) => ({ value: _id, label: nombre }))
        )
      );
  }

  searchIdentityCandidates(term: string): Observable<IdentityCandidate[]> {
    const params = new HttpParams({ fromObject: { term } });
    return this.http.get<IdentityCandidate[]>(`${this.URL}/assign/users`, {
      params,
    });
  }

  findAll({
    limit,
    offset,
    term,
    institution,
    dependency,
  }: FilterAccountsParams) {
    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(institution && { institution }),
        ...(dependency && { dependency }),
      },
    });
    return this.http
      .get<{ accounts: account[]; length: number }>(`${this.URL}`, {
        params,
      })
      .pipe(
        map(({ accounts, length }) => ({
          accounts: accounts.map((account) =>
            AccountMapper.fromResponse(account)
          ),
          length,
        }))
      );
  }

  create(request: CreateAccountRequest): Observable<Account> {
    return this.http
      .post<account>(this.URL, request)
      .pipe(map((response) => AccountMapper.fromResponse(response)));
  }

  update(id: string, request: UpdateAccountRequest): Observable<Account> {
    return this.http
      .patch<account>(`${this.URL}/${id}`, request)
      .pipe(map((response) => AccountMapper.fromResponse(response)));
  }
}
