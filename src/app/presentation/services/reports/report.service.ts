import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  account,
  communicationResponse,
  dependencyResponse,
  externalResponse,
  institution,
  internalResponse,
  procedure,
  reportUnit,
  reportWorkAccount,
  TableProcedureData,
  typeProcedureResponse,
} from '../../../infraestructure/interfaces';
import { GroupProcedure, StatusMail } from '../../../domain/models';

interface SearchApplicantProps {
  by: 'solicitante' | 'representante';
  limit: number;
  offset: number;
  form: Object;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly url = `${environment.base_url}/reports`;

  constructor(private http: HttpClient) {}

  getTypeProceduresByText(term: string, type?: GroupProcedure) {
    const mapGroup = {
      [GroupProcedure.External]: 'EXTERNO',
      [GroupProcedure.Internal]: 'INTERNO',
    };
    return this.http.get<typeProcedureResponse[]>(
      `${this.url}/types-procedures/${term}`,
      { ...(type && { params: { type: mapGroup[type] } }) }
    );
  }

  searchProcedureByApplicant({
    by,
    form,
    limit,
    offset,
  }: SearchApplicantProps) {
    const params = new HttpParams({ fromObject: { limit, offset } });
    const properties = this.removeEmptyValuesFromObject(form);
    return this.http
      .post<{ procedures: externalResponse[]; length: number }>(
        `${this.url}/applicant`,
        { by, properties },
        { params }
      )
      .pipe(
        map((resp) => ({
          procedures: resp.procedures.map(
            ({ details: { solicitante }, ...props }) => ({
              ...props,
              applicant: [
                solicitante.nombre,
                solicitante.paterno,
                solicitante.materno,
              ]
                .filter(Boolean)
                .join(' '),
            })
          ),
          length: resp.length,
        }))
      );
  }

  searchProcedureByProperties(limit: number, offset: number, form: Object) {
    const params = new HttpParams({ fromObject: { limit, offset } });
    const properties = this.removeEmptyValuesFromObject(form);
    return this.http
      .post<{
        procedures: externalResponse[] | internalResponse[];
        length: number;
      }>(`${this.url}/procedure`, properties, {
        params,
      })
      .pipe(
        map((resp) => ({
          procedures: this.responseToInterface(resp.procedures),
          length: resp.length,
        }))
      );
  }

  getUnlinkAccountData() {
    return this.http
      .get<{ account: account; inbox: communicationResponse[] }>(
        `${this.url}/unlink`
      )
      .pipe(
        map((resp) => {
          return { accont: resp.account, inbox: resp.inbox };
        })
      );
  }

  getInboxAccount(accountId: string) {
    return this.http.get<communicationResponse[]>(
      `${this.url}/inbox/${accountId}`
    );
  }
  getPendingsByUnit(dependencyId: string) {
    return this.http
      .get<reportUnit[]>(`${this.url}/unit/pendings/${dependencyId}`)
      .pipe(
        map((resp) =>
          resp.map(({ _id: { _id, funcionario }, details }) => ({
            id: _id,
            officer: funcionario
              ? {
                  fullname: `${funcionario.nombre} ${funcionario.paterno} ${funcionario.materno}`,
                  jobtitle: funcionario.cargo?.nombre ?? 'SIN CARGO',
                }
              : undefined,
            details: Object.values(StatusMail).reduce((acc, curr) => {
              const status = details.find((el) => el.status === curr);
              return { [curr]: status?.total ?? 0, ...acc };
            }, {}),
          }))
        )
      );
  }

  getPendingsByAccount(id_account: string) {
    return this.http.get<communicationResponse[]>(
      `${this.url}/pending/${id_account}`
    );
  }

  getDependencies(institutionId: string) {
    return this.http.get<dependencyResponse[]>(
      `${this.url}/dependencies/${institutionId}`
    );
  }
  getInstitutions() {
    return this.http.get<institution[]>(`${this.url}/institutions`);
  }

  getWorkDetails(id_account: string) {
    return this.http
      .get<reportWorkAccount[]>(`${this.url}/communication/total/${id_account}`)
      .pipe(
        map((resp) => {
          const map = {
            [StatusMail.Received]: 'RECIBIDOS',
            [StatusMail.Pending]: 'SIN RECIBIR',
            [StatusMail.Archived]: 'ARCHIVADOS',
            [StatusMail.Completed]: 'ANTENDIDOS',
            [StatusMail.Rejected]: 'RECHAZADOS',
            [StatusMail.Forwarding]: 'REENVIADO',
          };
          return Object.values(StatusMail).map((status) => {
            const item = resp.find((el) => el._id === status);
            return { label: map[status], count: item ? item.count : 0 };
          });
        })
      );
  }

  private removeEmptyValuesFromObject(form: Object) {
    return Object.entries(form).reduce(
      (acc, [key, value]) => (value ? { ...acc, [key]: value } : acc),
      {}
    );
  }
  private responseToInterface(procedures: procedure[]): TableProcedureData[] {
    return procedures.map(
      ({ _id, group, reference, startDate, code, state }) => ({
        _id: _id,
        group: group,
        state: state,
        reference: reference,
        startDate: startDate,
        code: code,
      })
    );
  }
}
