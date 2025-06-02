import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/resourcesa`;

  constructor() {}

  getCategories() {
    return this.http.get<string[]>(this.URL);
  }
}
