import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { institution } from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class InstitutionService {
  private readonly URL = `${environment.base_url}/institutions`;
  private http = inject(HttpClient);

  findAll(limit: number, offset: number, term: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{
      institutions: institution[];
      length: number;
    }>(`${this.URL}`, { params });
  }

  create(form: Object) {
    return this.http.post<institution>(`${this.URL}`, form);
  }

  update(id: string, form: Object) {
    return this.http.patch<institution>(`${this.URL}/${id}`, form);
  }
}
