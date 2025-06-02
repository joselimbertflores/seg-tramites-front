import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { groupedResource } from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/resources`;

  constructor() {}

  create(
    category: string,
    fileProps: { fileName: string; originalName: string }[]
  ) {
    return this.http.post<groupedResource>(`${this.URL}`, {
      category,
      items: fileProps,
    });
  }

  remove(id: string) {
    return this.http.delete<{ message: string }>(`${this.URL}/${id}`);
  }

  findAllGroupedByCategory() {
    return this.http.get<groupedResource[]>(`${this.URL}/grouped`);
  }

  getCategories() {
    return this.http.get<string[]>(`${this.URL}/categories`);
  }
}
