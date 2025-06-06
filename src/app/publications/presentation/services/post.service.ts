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
export class PostService {
  private readonly url = `${environment.base_url}/posts`;
  private http = inject(HttpClient);
  constructor() {}

  create(form: Object, image: string | null, attachments: attachmentFile[]) {
    return this.http.post<publication>(this.url, {
      ...form,
      image,
      attachments,
    });
  }

  update({ id, attachments, image, form }: updatePublicationProps) {
    return this.http.patch<publication>(`${this.url}/${id}`, {
      ...form,
      image,
      attachments,
    });
  }

  findAll(limit: number = 10, offset: number = 0) {
    const params = new HttpParams({ fromObject: { limit, offset } });
    return this.http.get<publication[]>(this.url, { params });
  }

  findByUser() {
    const params = new HttpParams({ fromObject: { limit: 10, offset: 0 } });
    return this.http.get<{ publications: publication[]; length: number }>(
      `${this.url}/user`,
      { params }
    );
  }

  getNews(limit: number = 10, offset: number = 0) {
    const params = new HttpParams({
      fromObject: { limit: limit, offset: offset },
    });
    return this.http.get<publication[]>(`${this.url}/news`, { params });
  }

  getFile(url: string) {
    return this.http.get(url, { responseType: 'blob' });
  }
}
