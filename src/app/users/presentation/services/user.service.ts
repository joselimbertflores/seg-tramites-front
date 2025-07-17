import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { user } from '../../infrastructure';

interface crendentialsProps {
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  dni: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly url = `${environment.base_url}/user`;
  private http = inject(HttpClient);

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ users: user[]; length: number }>(this.url, {
      params,
    });
  }

  create(form: Object) {
    return this.http.post<user>(this.url, form);
  }

  update(id: string, form: { [key: string]: string | number }) {
    if (form['password'] === '') delete form['password'];
    return this.http.patch<user>(`${this.url}/${id}`, form);
  }

  getRoles() {
    return this.http.get<any[]>(`${this.url}/roles`);
  }
}
