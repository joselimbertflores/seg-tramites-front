import { inject, Injectable, resource, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  account,
  officer,
  dependency,
  institution,
  AccountMapper,
  OfficerMapper,
} from '../../infrastructure';
import { role } from '../../../users/infrastructure';
import { lab } from 'd3';

interface FilterAccountsParams {
  limit: number;
  offset: number;
  term?: string;
  dependency?: string;
}

interface selectOption {
  value: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly URL = `${environment.base_url}/accounts`;
  private http = inject(HttpClient);

  institutions = toSignal(this.getInstitutions(), { initialValue: [] });
  selectedInstitution = signal<string | null>(null);
  selectedDependency = signal<string | null>(null);
  dependencies = resource({
    params: () => ({ institution: this.selectedInstitution() }),
    loader: ({ params }) =>
      params.institution
        ? firstValueFrom(this.getDependencies(params.institution))
        : firstValueFrom(of([])),
  });

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

  searchOfficersWithoutAccount(term: string) {
    const params = new HttpParams({ fromObject: { term } });
    return this.http
      .get<officer[]>(`${this.URL}/assign`, { params })
      .pipe(
        map((resp) =>
          resp
            .map((resp) => OfficerMapper.fromResponse(resp))
            .map((officer) => ({ value: officer, label: officer.fullName }))
        )
      );
  }

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(this.selectedInstitution() && {
          institution: this.selectedInstitution()!,
        }),
        ...(this.selectedDependency() && {
          dependency: this.selectedDependency()!,
        }),
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

  create(formUser: Object, formAccount: Object) {
    return this.http
      .post<account>(this.URL, { user: formUser, account: formAccount })
      .pipe(map((resp) => AccountMapper.fromResponse(resp)));
  }

  update(id: string, formUser: object, formAccount: object) {
    console.log(formAccount);
    return this.http
      .patch<account>(`${this.URL}/${id}`, {
        // user: formUser,
        account: formAccount,
      })
      .pipe(map((resp) => AccountMapper.fromResponse(resp)));
  }

  resetAccountAccess(id: string) {
    return this.http
      .get<{ newLogin: string; pdfBase64: string }>(
        `${this.URL}/reset-credentials/${id}`
      )
      .pipe(
        tap(({ pdfBase64 }) => {
          this.showPdfFromBase64(pdfBase64);
        }),
        map(({ newLogin }) => newLogin)
      );
  }

  unlink(id: string) {
    return this.http.delete<{ message: string }>(`${this.URL}/unlink/${id}`);
  }

  getDetails(id_cuenta: string) {
    return this.http
      .get<{
        ok: boolean;
        details: {
          externos?: number;
          internos?: number;
          entrada?: number;
          salida?: number;
        };
      }>(`${this.URL}/cuentas/details/${id_cuenta}`)
      .pipe(
        map((resp) => {
          return resp.details;
        })
      );
  }

  showPdfFromBase64(base64: string): void {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters).map((c) => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }
}
