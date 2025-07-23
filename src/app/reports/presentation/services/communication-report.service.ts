import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  tableProcedureData,
  unlinkDataResponse,
  totalCommunicationsByUnitResponse,
} from '../../infrastructure';
import { communication } from '../../../communications/infrastructure';
import { environment } from '../../../../environments/environment';
import { sendStatus } from '../../../communications/domain';
import { skipUploadIndicator } from '../../../helpers';

interface totalCommunicationsByUnitParams {
  startDate: Date;
  endDate: Date;
  group: string;
  dependencyId: string;
}

interface historyParams {
  limit: number;
  offset: number;
  term: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationReportService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/report-communications`;

  getTotalByUnit({
    dependencyId,
    startDate,
    endDate,
    group,
  }: totalCommunicationsByUnitParams) {
    const body = {
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      group,
    };
    return this.http
      .post<totalCommunicationsByUnitResponse[]>(
        `${this.URL}/unit/${dependencyId}`,
        body,
        {
          context: skipUploadIndicator(),
        }
      )
      .pipe(
        map((resp) => {
          const statusList = Object.values(sendStatus);
          return resp.map(({ statusCounts, ...props }) => {
            const statusMap = new Map(
              statusCounts.map(({ status, count }) => [status, count])
            );
            const flatStatusCounts = statusList.reduce((acc, current) => {
              acc[current] = statusMap.get(current) || 0;
              return acc;
            }, {} as Record<string, number>);
            return {
              ...props,
              ...flatStatusCounts,
            };
          });
        })
      );
  }

  getInboxByAccount(accountId: string) {
    return this.http
      .get<communication[]>(`${this.URL}/inbox/${accountId}`)
      .pipe(
        map((resp) =>
          resp.map(({ procedure, sender, sentDate, status }) => ({
            ...procedure,
            senderFullName: `${sender.fullname}`,
            sentDate: new Date(sentDate).toLocaleDateString(),
            received: status === 'received' ? 'SI' : 'NO',
          }))
        )
      );
  }

  getHistory({ limit, offset, term, ...props }: historyParams): Observable<{
    data: tableProcedureData[];
    length: number;
  }> {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .post<{ communications: communication[]; length: number }>(
        `${this.URL}/history`,
        props,
        { params, context: skipUploadIndicator() }
      )
      .pipe(
        map(({ communications, length }) => ({
          length,
          data: communications.map(({ procedure, recipient, sentDate }) => ({
            id: procedure.ref,
            group: procedure.group,
            code: procedure.code,
            reference: procedure.reference,
            createdAt: new Date(sentDate).toLocaleString(),
            person: recipient.fullname,
          })),
        }))
      );
  }

  getUnlinkData() {
    return this.http.get<unlinkDataResponse>(`${this.URL}/unlink`);
  }
}
