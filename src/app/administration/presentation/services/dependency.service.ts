import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  account,
  dependency,
  institution,
  OfficerMapper,
} from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class DependencyService {
  private readonly url = `${environment.base_url}/dependencies`;
  constructor(private http: HttpClient) {}

  getInstitutions() {
    return this.http.get<institution[]>(`${this.url}/institutions`);
  }

  getAccountsInDependency(id: string) {
    return this.http.get<account[]>(`${this.url}/${id}/accounts`).pipe(
      map((resp) =>
        resp.map(({ officer, _id, jobtitle, area }) => ({
          accountId: _id,
          jobtitle: jobtitle,
          area: area ?? null,
          ...(officer && { officer: OfficerMapper.fromResponse(officer) }),
        }))
      )
    );
  }
  assignDependencyAreas(data: { accountId: string; area: number | null }[]) {
    return this.http.put<{ message: string }>(`${this.url}/assign-area`, {
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
    }>(`${this.url}`, { params });
  }

  create(form: Object) {
    return this.http.post<dependency>(`${this.url}`, form);
  }

  update(id: string, form: Object) {
    return this.http.patch<dependency>(`${this.url}/${id}`, form);
  }
}
