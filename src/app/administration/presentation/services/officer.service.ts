import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { officer, OfficerMapper } from '../../infrastructure';
import { Officer } from '../../domain';

@Injectable({
  providedIn: 'root',
})
export class OfficerService {
  private readonly URL = `${environment.base_url}/officers`;

  constructor(private http: HttpClient) {}

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{ officers: officer[]; length: number }>(`${this.URL}`, { params })
      .pipe(
        map(({ officers, length }) => ({
          officers: officers.map((officer) =>
            OfficerMapper.fromResponse(officer)
          ),
          length,
        }))
      );
  }

  create(form: object): Observable<Officer> {
    return this.http
      .post<officer>(`${this.URL}`, form)
      .pipe(map((resp) => OfficerMapper.fromResponse(resp)));
  }

  update(id: string, officer: object): Observable<Officer> {
    return this.http
      .patch<officer>(`${this.URL}/${id}`, officer)
      .pipe(map((resp) => OfficerMapper.fromResponse(resp)));
  }
}
