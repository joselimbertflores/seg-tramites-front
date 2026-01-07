import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataSource {
  private http = inject(HttpClient);
  private readonly url = `${environment.base_url}/projects`;

  findAll() {
    // const params = new HttpParams({
    //   fromObject: { limit, offset, ...(term && { term }) },
    // });
    return this.http.get<{ projects: any[]; length: number }>(`${this.url}`);
  }

  create(form: Object) {
    return this.http.post<any>(`${this.url}`, form);
  }

  update(id: string, form: Object) {
    return this.http.patch<any>(`${this.url}/${id}`, form);
  }

  updateDocuments(id: string, form: Object) {
    return this.http.patch<any>(`${this.url}/documents/${id}`, form);
  }

  getDetail(id: string) {
    return this.http.get<any>(`${this.url}/detail/${id}`);
  }

  confirm(id: string, index: number) {
    return this.http.post<any>(
      `${this.url}/${id}/requirement/${index}/confirm`,
      {}
    );
  }

  search(term: string) {
    const params = new HttpParams().set('term', term);
    return this.http.get<any[]>(`${this.url}/search`, { params });
  }
}
