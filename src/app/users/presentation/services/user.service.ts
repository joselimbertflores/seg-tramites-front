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

   generateCredentials({
    firstName,
    paternalLastName,
    maternalLastName,
    dni,
  }: crendentialsProps) {
    const clean = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD') // elimina tildes
        .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
        .replace(/[^a-z]/g, ''); // solo letras

    const firstNameClean = clean(firstName);
    const paternalLastNameClean = clean(paternalLastName);
    const maternalLastNameClean = clean(maternalLastName);

    // Generar login: inicial nombre + paterno + inicial materno (todo sin espacios ni caracteres extra)
    const login = `${firstNameClean.charAt(0)}${paternalLastNameClean}${maternalLastNameClean.charAt( 0 )}`;

    // Generar contraseña segura aleatoria
    const password = this.generateRandomPassword(10);

    return { login, password };
  }

  private generateRandomPassword(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
