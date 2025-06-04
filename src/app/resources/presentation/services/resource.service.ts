import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { groupedResource } from '../../infrastructure';

interface fileProps {
  fileName: string;
  originalName: string;
}
@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/resources`;

  private cacheResources = signal<groupedResource[]>([]);

  constructor() {}

  create(category: string, fileProps: fileProps[]) {
    return this.http
      .post<groupedResource>(`${this.URL}`, {
        category,
        items: fileProps,
      })
      .pipe(tap((resp) => this.addResource(resp)));
  }

  remove(id: string) {
    return this.http
      .delete<{ message: string }>(`${this.URL}/${id}`)
      .pipe(tap(() => this.removeFileResource(id)));
  }

  findAllGroupedByCategory() {
    return this.cacheResources().length === 0
      ? this.http
          .get<groupedResource[]>(`${this.URL}/grouped`)
          .pipe(tap((data) => this.cacheResources.set(data)))
      : of(this.cacheResources());
  }

  getCategories() {
    return this.http.get<string[]>(`${this.URL}/categories`);
  }

  private addResource(newResource: groupedResource) {
    this.cacheResources.update((values) => {
      const index = values.findIndex(
        ({ category }) => category === newResource.category
      );
      if (index === -1) {
        return [newResource, ...values];
      } else {
        values[index].files = [...newResource.files];
        return [...values];
      }
    });
  }

  private removeFileResource(id: string) {
    this.cacheResources.update((values) =>
      values
        .map((group) => {
          if (!group.files.some((file) => file._id === id)) return group;
          return {
            ...group,
            files: group.files.filter(({ _id }) => _id !== id),
          };
        })
        .filter((group) => group.files.length > 0)
    );
  }
}
