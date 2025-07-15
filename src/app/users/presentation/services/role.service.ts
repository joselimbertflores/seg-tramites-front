import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { role, systemResourceResponse } from '../../infrastructure';
import { systemResource } from '../../domain';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/roles`;
  private resources$: Observable<systemResourceResponse[]>;

  getSystemResources() {
    if (this.resources$) return this.resources$;
    this.resources$ = this.http
      .get<systemResourceResponse[]>(`${this.URL}/resources`)
      .pipe(shareReplay(1));
    return this.resources$;
  }

  findAll(limit: number, offset: number, term: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{ roles: role[]; length: number }>(`${this.URL}`, { params })
      .pipe(map((resp) => ({ roles: resp.roles, length: resp.length })));
  }

  create(name: string, resources: systemResource[]) {
    return this.http.post<role>(`${this.URL}`, {
      name,
      permissions: this.buildResourcesDto(resources),
    });
  }

  update(id: string, name: string, resources: systemResource[]) {
    return this.http.patch<role>(`${this.URL}/${id}`, {
      name,
      permissions: this.buildResourcesDto(resources),
    });
  }

  private buildResourcesDto(resources: systemResource[]) {
    return resources
      .filter(({ actions }) => actions.some((action) => action.isSelected))
      .map(({ value, actions }) => ({
        resource: value,
        actions: actions
          .filter(({ isSelected }) => isSelected)
          .map(({ value }) => value),
      }));
  }
}
