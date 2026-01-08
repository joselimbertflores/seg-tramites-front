import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  account,
  officer,
  dependency,
  institution,
  AccountMapper,
  OfficerMapper,
  MailResult,
} from '../../infrastructure';
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

  create(formUser: Object, formAccount: Object) {
    return this.http
      .post<{ account: account; pdfBase64: string; mail?: MailResult }>(
        this.URL,
        {
          user: formUser,
          account: formAccount,
        }
      )
      .pipe(
        tap(({ pdfBase64 }) => this.showPdfFromBase64(pdfBase64)),
        map(({ account, mail }) => ({
          account: AccountMapper.fromResponse(account),
          mail,
        }))
      );
  }

  update(id: string, formUser: object, formAccount: object) {
    return this.http
      .patch<{ account: account; pdfBase64: string | null; mail?: MailResult }>(
        `${this.URL}/${id}`,
        {
          user: formUser,
          account: formAccount,
        }
      )
      .pipe(
        tap(({ pdfBase64 }) => {
          if (pdfBase64) {
            this.showPdfFromBase64(pdfBase64);
          }
        }),
        map(({ account, mail }) => ({
          account: AccountMapper.fromResponse(account),
          mail,
        }))
      );
  }

  resetPassword(id: string) {
    return this.http
      .patch<{ pdfBase64: string; mail?: MailResult }>(
        `${this.URL}/reset-password/${id}`,
        {}
      )
      .pipe(
        tap(({ pdfBase64 }) => this.showPdfFromBase64(pdfBase64)),
        map(({ mail }) => mail)
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
