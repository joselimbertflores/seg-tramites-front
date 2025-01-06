import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  private readonly url = `${environment.base_url}/archives`;
  private http = inject(HttpClient);
  constructor() {}

  create(form: Object) {
    return this.http.post(this.url, form);
  }
}
