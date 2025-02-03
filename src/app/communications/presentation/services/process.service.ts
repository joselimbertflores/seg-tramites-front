import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  external,
  ExternalMapper,
  internal,
  InternalMapper,
} from '../../../procedures/infrastructure';
import { communication } from '../../infrastructure';

@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  private readonly url = `${environment.base_url}/process`;
  private http = inject(HttpClient);
  constructor() {}

  getProcedure(id: string, group: string) {
    return this.http
      .get<internal | external>(`${this.url}/detail/${group}/${id}`)
      .pipe(
        tap((resp) => console.log(resp)),
        map((resp) => {
          switch (resp.group) {
            case 'ExternalProcedure':
              return ExternalMapper.fromResponse(resp as external);

            case 'InternalProcedure':
              return InternalMapper.fromResponse(resp as internal);

            case 'ProcurementProcedure':
              return resp

            default:
              throw Error('Procedure is not defined');
          }
        })
      );
  }

  getWorkflow(id: string) {
    return this.http.get<communication[]>(`${this.url}/workflow/${id}`);
  }
}
