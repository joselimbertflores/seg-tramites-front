import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { tableProcedureData } from '../../infrastructure';
import {
  external,
  internal,
  procurement,
} from '../../../procedures/infrastructure';
import { skipUploadIndicator } from '../../../helpers';

type procedureResponse = external | internal | procurement;

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly url = `${environment.base_url}/reports`;
  private http = inject(HttpClient);

  searchProcedureByProperties(limit: number, offset: number, form: Object) {
    const params = new HttpParams({ fromObject: { limit, offset } });
    const properties = this.removeEmptyValuesFromObject(form);
    return this.http
      .post<{ procedures: procedureResponse[]; length: number }>(
        `${this.url}/procedure`,
        properties,
        { params, context: skipUploadIndicator() }
      )
      .pipe(
        map(({ procedures, length }) => ({
          procedures: this.responseToTableData(procedures),
          length,
        }))
      );
  }

  private removeEmptyValuesFromObject(value: Object) {
    return Object.entries(value).reduce(
      (acc, [key, value]) => (value ? { ...acc, [key]: value } : acc),
      {}
    );
  }

  private responseToTableData(items: procedureResponse[]) {
    return items.map((item) => ({
      id: item._id,
      group: item.group,
      state: item.state,
      reference: item.reference,
      createdAt: item.createdAt,
      code: item.code,
    }));
  }
}
