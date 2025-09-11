import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { FileUploadService } from '../../../shared';
import { publication } from '../../infrastructure';

interface updatePublicationProps {
  id: string;
  form: Object;
  currentImage: string | null;
  currentFiles: attachmentFile[];
  newImage: File | null;
  newFiles: File[];
}
interface attachmentFile {
  fileName: string;
  originalName: string;
}

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private http = inject(HttpClient);
  private fileUploadService = inject(FileUploadService);
  private readonly URL = `${environment.base_url}/posts`;

  constructor() {}

  create(form: Object, image: File | null, files: File[]) {
    return this.buildFileUploadTask(image, files).pipe(
      switchMap(([image, ...uploadedFiles]) =>
        this.http.post<publication>(this.URL, {
          ...form,
          image: image?.fileName,
          attachments: uploadedFiles.map((file) => ({
            fileName: file.fileName,
            originalName: file.originalName,
          })),
        })
      )
    );
  }

  update({
    id,
    form,
    newFiles,
    newImage,
    currentImage,
    currentFiles = [],
  }: updatePublicationProps) {
    return this.buildFileUploadTask(newImage, newFiles).pipe(
      switchMap(([image, ...uploadedFiles]) =>
        this.http.patch<publication>(`${this.URL}/${id}`, {
          ...form,
          image: image?.fileName ?? currentImage?.split('/').pop() ?? null,
          attachments: [
            ...currentFiles.map((item) => ({
              fileName: item.fileName.split('/').pop(),
              originalName: item.originalName,
            })),
            ...uploadedFiles,
          ],
        })
      )
    );
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

  private buildFileUploadTask(image: File | null, files: File[]) {
    return forkJoin([
      image ? this.fileUploadService.uploadFile(image, 'post') : of(null),
      ...files.map((file) => this.fileUploadService.uploadFile(file, 'post')),
    ]);
  }
}
