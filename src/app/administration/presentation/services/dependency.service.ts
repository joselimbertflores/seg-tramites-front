import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  account,
  dependency,
  institution,
  AccountMapper,
} from '../../infrastructure';
import { Account } from '../../domain';

@Injectable({
  providedIn: 'root',
})
export class DependencyService {
  private readonly URL = `${environment.base_url}/dependencies`;
  
  constructor(private http: HttpClient) {}

  getInstitutions() {
    return this.http
      .get<institution[]>(`${this.URL}/institutions`)
      .pipe(
        map((resp) =>
          resp.map(({ _id, nombre }) => ({ value: _id, label: nombre }))
        )
      );
  }

  getAccountsInDependency(id: string) {
    return this.http
      .get<account[]>(`${this.URL}/${id}/accounts`)
      .pipe(
        map((resp) => resp.map((item) => AccountMapper.fromResponse(item)))
      );
  }

  assignAreas(personnel:Account[]) {
     const data = personnel.map(({id, area}) => ({ accountId:id, area}));
    return this.http.put<{ message: string }>(`${this.URL}/areas`, {
      personnel: data,
    });
  }

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{
      dependencies: dependency[];
      length: number;
    }>(`${this.URL}`, { params });
  }

  create(form: Object) {
    return this.http.post<dependency>(`${this.URL}`, form);
  }

  update(id: string, form: Object) {
    return this.http.patch<dependency>(`${this.URL}/${id}`, form);
  }
}
