import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { account, AccountMapper } from '../../../administration/infrastructure';
import { doc, DocMapper } from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private readonly url = `${environment.base_url}/documents`;
  private http = inject(HttpClient);

  constructor() {}

  searchAccounts(term: string) {
    const params = new HttpParams({ fromObject: { term } });
    return this.http
      .get<account[]>(`${this.url}/accounts`, { params })
      .pipe(map((resp) => resp.map((el) => AccountMapper.fromResponse(el))));
  }

  findAll() {
    return this.http.get<{ documents: doc[]; length: number }>(this.url).pipe(
      map(({ documents, length }) => ({
        documents: documents.map((el) => DocMapper.fromResponse(el)),
        length,
      }))
    );
  }

  create(form: Object) {
    return this.http.post(this.url, form);
  }

  update(id: string, form: Object) {
    return this.http.patch(`${this.url}/${id}`, form);
  }

  searchPendingDocs(term?: string) {
    const params = new HttpParams({ fromObject: { ...(term && { term }) } });
    return this.http.get<doc[]>(`${this.url}/pending`, { params });
  }
}
