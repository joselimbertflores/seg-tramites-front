import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  external,
  ExternalMapper,
  internal,
  InternalMapper,
  procurement,
  ProcurementMapper,
} from '../../../procedures/infrastructure';
import { communication, CommunicationMapper } from '../../infrastructure';
import { procedureGroup } from '../../../procedures/domain';

type procedureResponses = internal | external | procurement;
@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  private readonly url = `${environment.base_url}/process`;
  private http = inject(HttpClient);
  constructor() {}

  getProcedure(id: string, group: string) {
    return this.http
      .get<procedureResponses>(`${this.url}/detail/${group}/${id}`)
      .pipe(
        map((resp) => {
          switch (resp.group) {
            case procedureGroup.External:
              return ExternalMapper.fromResponse(resp as external);

            case procedureGroup.Internal:
              return InternalMapper.fromResponse(resp as internal);

            case procedureGroup.Procurement:
              return ProcurementMapper.fromResponse(resp as procurement);

            default:
              throw Error('Procedure is not defined');
          }
        })
      );
  }

  getWorkflow(id: string) {
    return this.http
      .get<communication[]>(`${this.url}/workflow/${id}`)
      .pipe(
        map((resp) =>
          resp.map((item) => CommunicationMapper.fromResponse(item))
        )
      );
  }
}
