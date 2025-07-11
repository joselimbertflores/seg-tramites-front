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
  procedureEfficiencyResponse,
  tableProcedureData,
  totalProcedureBySegmentResponse,
} from '../../infrastructure';
import { procedureGroup } from '../../../procedures/domain';

type procedureResponse = external | internal | procurement;

interface searchApplicantProps {
  by: 'applicant' | 'representative';
  limit: number;
  offset: number;
  form: Object;
  typeProcedure?: string;
}

interface getTotalBySegmentProps {
  institutionId: string;
  startDate: Date;
  endDate: Date;
  group: procedureGroup;
}

@Injectable({
  providedIn: 'root',
})
export class ProcedureReportService {
  private readonly url = `${environment.base_url}/report-procedures`;
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

  searchProcedureByProperties(
    limit: number,
    offset: number,
    form: Object
  ): Observable<{ procedures: tableProcedureData[]; length: number }> {
    const params = new HttpParams({ fromObject: { limit, offset } });
    const properties = this.removeEmptyValuesFromObject(form);
    return this.http
      .post<{ procedures: procedureResponse[]; length: number }>(
        `${this.url}/search`,
        properties,
        { params, context: skipUploadIndicator() }
      )
      .pipe(
        map(({ procedures, length }) => ({
          procedures: procedures.map((item) => ({
            id: item._id,
            group: item.group,
            code: item.code,
            reference: item.reference,
            state: item.state,
            createdAt: this.formatDate(item.createdAt),
          })),
          length,
        }))
      );
  }

  searchProcedureByApplicant({
    by,
    limit,
    offset,
    form,
    typeProcedure,
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
        map(({ procedures, length }) => ({
          procedures: procedures.map((item) => ({
            id: item._id,
            code: item.code,
            group: item.group,
            state: item.state,
            reference: item.reference,
            firstname: item.applicant.firstname,
            lastname: item.applicant.lastname,
            middlename: item.applicant.middlename,
            createdAt: this.formatDate(item.createdAt),
          })),
          length,
        }))
      );
  }

  getProceduresEfficiency(filterParams: object) {
    return this.http.post<procedureEfficiencyResponse>(`${this.url}/eficiency`, filterParams);
  }

  getTotalBySegments(filterProps: getTotalBySegmentProps) {
    return this.http.post<totalProcedureBySegmentResponse>(
      `${this.url}/segments`,
      filterProps
    );
  }

  private removeEmptyValuesFromObject(value: Object) {
    return Object.entries(value).reduce(
      (acc, [key, value]) => (value ? { ...acc, [key]: value } : acc),
      {}
    );
  }

  private formatDate(date: string) {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}
