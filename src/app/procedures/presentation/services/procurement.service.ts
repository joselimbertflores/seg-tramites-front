import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

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
    return this.http.get<{ procedures: any[]; length: number }>(`${this.url}`, {
      params,
    });
    // .pipe(
    //   // map(({ procedures, length }) => ({
    //   //   procedures: procedures.map((item) =>
    //   //     ExternalMapper.fromResponse(item)
    //   //   ),
    //   //   length,
    //   // }))
    // );
  }

  create(form: Object) {
    return this.http.post<any>(`${this.url}`, form);
    // .pipe(map((response) => ExternalMapper.fromResponse(response)));
  }

  update(id: string, form: Object) {
    return this.http.patch<any>(`${this.url}/${id}`, form);
  }

  getDetail(procedureId: string) {
    return this.http.get<any>(`${this.url}/${procedureId}`);
  }
}
