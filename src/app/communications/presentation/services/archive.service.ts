import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {
  private readonly url = `${environment.base_url}/folders`;
  private http = inject(HttpClient);
  constructor() { }

  createFolder(name: string): Observable<{ id: number; name: string }> {
    return this.http.post<{ id: number; name: string }>(this.url, {
      name,
    });
  }

  getFolders(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(this.url);
  }

  deleteFolder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
