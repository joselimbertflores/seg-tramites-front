import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { skipUploadIndicator } from '../../../helpers';
import {
  external,
  internal,
  procurement,
} from '../../../procedures/infrastructure';
import { typeProcedure } from '../../../administration/infrastructure';
import {
  tableProcedureData,
  totalCommunicationsByUnitResponse,
} from '../../infrastructure';
import { procedureGroup } from '../../../procedures/domain';
import { sendStatus } from '../../../communications/domain';

type procedureResponse = external | internal | procurement;

interface searchApplicantProps {
  by: 'applicant' | 'representative';
  limit: number;
  offset: number;
  form: Object;
  typeProcedure?: string;
}

interface getTotalCommunicationsByUnitParams {
  startDate: Date;
  endDate: Date;
  participant: 'sender' | 'recipient';
  group: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProcedureReportService {
  private readonly url = `${environment.base_url}/reports`;
  private http = inject(HttpClient);

  getTypeProcedures(term?: string) {
    const params = new HttpParams({ fromObject: { ...(term && { term }) } });
    return this.http
      .get<typeProcedure[]>(`${this.url}/types-procedures`, { params })
      .pipe(
        map((resp) =>
          resp.map((item) => ({ label: item.nombre, value: item._id }))
        )
      );
  }

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
          procedures: this.responseToProcedureTableData(procedures),
          length,
        }))
      );
  }

  searchProcedureByApplicant({
    limit,
    offset,
    typeProcedure,
    by,
    form,
  }: searchApplicantProps): Observable<{
    procedures: tableProcedureData[];
    length: number;
  }> {
    const params = new HttpParams({ fromObject: { limit, offset } });
    const properties = this.removeEmptyValuesFromObject(form);
    return this.http
      .post<{ procedures: external[]; length: number }>(
        `${this.url}/applicant`,
        { by, properties, ...(typeProcedure && { typeProcedure }) },
        { params }
      )
      .pipe(
        map((resp) => ({
          procedures: this.responseToProcedureTableData(resp.procedures),
          length: resp.length,
        }))
      );
  }

  getTotalCommunicationsByUnit({
    startDate,
    endDate,
    ...props
  }: getTotalCommunicationsByUnitParams) {
    return this.http
      .post<totalCommunicationsByUnitResponse[]>(
        `${this.url}/unit`,
        {
          startDate: startDate.toString(),
          endDate: endDate.toString(),
          ...props,
        },
        { context: skipUploadIndicator() }
      )
      .pipe(
        map((resp) => {
          const allStatuses = Object.values(sendStatus);
          return resp.map((item) => {
            const counts: Record<string, number> = {};
            for (const status of allStatuses) {
              counts[status] = 0;
            }
            for (const statusCount of item.statusCounts) {
              counts[statusCount.status] = statusCount.count;
            }
            return {
              officer: item.officer,
              jobTitle: item.jobTitle,
              accountId: item.accountId,
              total: item.total,
              ...counts,
            };
          });
        })
      );
  }

  private removeEmptyValuesFromObject(value: Object) {
    return Object.entries(value).reduce(
      (acc, [key, value]) => (value ? { ...acc, [key]: value } : acc),
      {}
    );
  }

  private responseToProcedureTableData(
    items: procedureResponse[]
  ): tableProcedureData[] {
    return items.map((item) => {
      let person: string = '';
      switch (item.group) {
        case procedureGroup.External:
          const { applicant } = item as external;
          person = [
            applicant.firstname,
            applicant.lastname,
            applicant.middlename,
          ]
            .filter((value) => value)
            .join(' ');
          break;
        case procedureGroup.Internal:
          const { sender } = item as internal;
          person = sender.fullname;
          break;
        default:
          break;
      }
      return {
        id: item._id,
        group: item.group,
        state: item.state,
        reference: item.reference,
        createdAt: new Date(item.createdAt).toLocaleString(),
        code: item.code,
        person,
      };
    });
  }
}
