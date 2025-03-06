import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  procurement,
  ProcurementMapper,
  docPropsProcurement,
} from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class ProcurementService {
  private readonly url = `${environment.base_url}/procurement`;
  constructor(private http: HttpClient) {}

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{ procedures: procurement[]; length: number }>(`${this.url}`, {
        params,
      })
      .pipe(
        map(({ procedures, length }) => ({
          procedures: procedures.map((item) =>
            ProcurementMapper.fromResponse(item)
          ),
          length,
        }))
      );
  }

  create(form: Object) {
    return this.http
      .post<procurement>(`${this.url}`, form)
      .pipe(map((response) => ProcurementMapper.fromResponse(response)));
  }

  update(id: string, form: Object) {
    return this.http
      .patch<procurement>(`${this.url}/${id}`, form)
      .pipe(map((resp) => ProcurementMapper.fromResponse(resp)));
  }

  updateDocuments(id: string, form: Object) {
    return this.http
      .patch<docPropsProcurement>(`${this.url}/documents/${id}`, form)
      .pipe(map(({ date, ...props }) => ({ ...props, date: new Date(date) })));
  }
}
