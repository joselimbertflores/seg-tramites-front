import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { typeProcedure } from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class TypeProcedureService {
  private readonly URL = `${environment.base_url}/types-procedures`;
  constructor(private http: HttpClient) {}

  getSegments() {
    return this.http.get<string[]>(`${this.URL}/segments`);
  }

  search(term: string, limit: number, offset: number) {
    const params = new HttpParams({ fromObject: { limit, offset } });
    return this.http.get<{ types: typeProcedure[]; length: number }>(
      `${this.URL}/search/${term}`,
      {
        params,
      }
    );
  }

  findAll(limit: number, offset: number, term: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ types: typeProcedure[]; length: number }>(
      `${this.URL}`,
      { params }
    );
  }

  create(form: Object) {
    return this.http.post<typeProcedure>(`${this.URL}`, form);
  }

  update(id: string, form: Object) {
    return this.http.patch<typeProcedure>(`${this.URL}/${id}`, form);
  }
}
