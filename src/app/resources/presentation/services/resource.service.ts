import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { groupedResource, resourceFile } from '../../infrastructure';

interface fileProps {
  fileName: string;
  originalName: string;
}
interface newResource {
  category: string;
  files: resourceFile[];
}
@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/resources`;

  isLoading = signal(true);
  resources = signal<groupedResource[]>([]);

  constructor() {
    this.findAllGroupedByCategory();
  }

  create(category: string, fileProps: fileProps[]) {
    return this.http
      .post<newResource>(`${this.URL}`, {
        category,
        items: fileProps,
      })
      .pipe(tap((resp) => this.addResource(resp)));
  }

  remove(id: string, category: string) {
    return this.http
      .delete<{ message: string }>(`${this.URL}/${id}`)
      .pipe(tap(() => this.removeFileResource(id, category)));
  }

  findAllGroupedByCategory() {
    this.http
      .get<groupedResource[]>(`${this.URL}/grouped`)
      .pipe(
        tap((data) => this.resources.set(data)),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((data) => {
        this.resources.set(data);
      });
  }

  getCategories() {
    return this.http.get<string[]>(`${this.URL}/categories`);
  }

  private addResource({ category, files }: newResource) {
    this.resources.update((values) => {
      const existing = values.find((item) => item.category === category);
      if (existing) {
        existing.files.unshift(...files);
      } else {
        values.unshift({ category, files });
      }
      return [...values];
    });
  }

  private removeFileResource(id: string, category: string) {
    this.resources.update((values) => {
      const group = values.find((item) => item.category === category);
      if (group) {
        group.files = group.files.filter((file) => file._id !== id);
        if (group.files.length === 0) {
          values = values.filter((item) => item.category !== category);
        }
      }
      return [...values];
    });
  }
}
