import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { publication } from '../../infrastructure/interfaces/publications.interface';
import { attachmentFile } from '../../domain';

interface updatePublicationProps {
  id: string;
  form: Object;
  image: string | null;
  attachments: attachmentFile[];
}

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private readonly URL = `${environment.base_url}/posts`;
  private http = inject(HttpClient);
  constructor() {}

  create(form: Object, image: string | null, attachments: attachmentFile[]) {
    return this.http.post<publication>(this.URL, {
      ...form,
      image,
      attachments,
    });
  }

  update({ id, attachments, image, form }: updatePublicationProps) {
    console.log({
      ...form,
      image,
      attachments,
    });
    return this.http.patch<publication>(`${this.URL}/${id}`, {
      ...form,
      image,
      attachments,
    });
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.URL}/${id}`);
  }

  findAll(limit: number = 10, offset: number = 0) {
    const params = new HttpParams({ fromObject: { limit, offset } });
    return this.http.get<publication[]>(this.URL, { params });
  }

  findByUser(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ publications: publication[]; length: number }>(
      `${this.URL}/user`,
      { params }
    );
  }

  getNews(limit: number = 10, offset: number = 0) {
    const params = new HttpParams({
      fromObject: { limit: limit, offset: offset },
    });
    return this.http.get<publication[]>(`${this.URL}/news`, { params });
  }

  getFile(url: string) {
    return this.http.get(url, { responseType: 'blob' });
  }
}
