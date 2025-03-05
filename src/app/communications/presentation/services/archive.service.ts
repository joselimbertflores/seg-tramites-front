import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

interface createArchiveProps {
  communicationIds: string[];
  status: string;
  folderI: string;
  description: string;
}
@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  private readonly url = `${environment.base_url}/archives`;
  private http = inject(HttpClient);
  constructor() {}

  create(form: createArchiveProps) {
    return this.http.post<{ message: string }>(this.url, form);
  }

  findAll(folderId: string | null) {
    const params = new HttpParams({
      fromObject: { ...(folderId && { folder: folderId }) },
    });
    return this.http.get<{
      archives: any[];
      lenght: number;
      folderName: string;
    }>(this.url, {
      params,
    });
  }
}
