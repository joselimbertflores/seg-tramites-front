import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  tableProcedureData,
  unlinkDataResponse,
  totalCommunicationsByUnitResponse,
  accountTrayStatus,
  CorrespondenceStatusByUnitResponse,
  CommunicationHistoryResponse,
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
  filterBy: string;
}

interface historyParams {
  limit: number;
  offset: number;
  term: string;
  startDate?: Date;
  endDate?: Date;
  isExport?: boolean;
}

const STATUS_MAP = {
  [sendStatus.Pending]: 'Sin recibir',
  [sendStatus.AutoRejected]: 'Rechazdo auttomatico',
  [sendStatus.Completed]: 'Completado',
  [sendStatus.Forwarding]: 'Reenviado',
  [sendStatus.Archived]: 'Archivado',
  [sendStatus.Received]: 'Recibido',
  [sendStatus.Rejected]: 'Rechazado',
};

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
    filterBy,
  }: totalCommunicationsByUnitParams) {
    const body = {
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      group,
      filterBy,
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

  getCorrespondenceStatusByUnit(
    filterBy: 'recipient' | 'sender',
    dependencyId?: string
  ) {
    const params = new HttpParams({
      fromObject: { filterBy, ...(dependencyId && { dependencyId }) },
    });
    return this.http.post<CorrespondenceStatusByUnitResponse[]>(
      `${this.URL}/correspondence-status`,
      params,
      { context: skipUploadIndicator() }
    );
  }

  getCorrespondenceByAccount(
    accountId: string,
    filterBy?: 'recipient' | 'sender'
  ) {
    const params = new HttpParams({
      fromObject: filterBy ? { filterBy } : {},
    });
    return this.http
      .get<communication[]>(`${this.URL}/inbox/${accountId}`, { params })
      .pipe(
        map((resp) =>
          resp.map(({ procedure, sender, recipient, sentDate, status }) => ({
            ...procedure,
            fullName:
              filterBy === 'recipient'
                ? `${recipient.fullname}`
                : `${sender.fullname}`,
            sentDate: new Date(sentDate).toLocaleDateString(),
            status: STATUS_MAP[status as sendStatus],
          }))
        )
      );
  }

  getHistory({
    limit = 10,
    offset = 0,
    term,
    isExport = false,
    ...props
  }: historyParams): Observable<{
    data: tableProcedureData[];
    length: number;
  }> {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }), export:isExport },
    });
    return this.http
      .post<{ communications: CommunicationHistoryResponse[]; length: number }>(
        `${this.URL}/history`,
        props,
        { params, context: skipUploadIndicator() }
      )
      .pipe(
        map(({ communications, length }) => ({
          length,
          data: communications.map(({ procedure, recipient, sentDate }) => ({
            id: procedure.ref._id,
            group: procedure.group,
            code: procedure.code,
            reference: procedure.reference,
            createdAt: new Date(sentDate).toLocaleString(),
            person: recipient.fullname,
            state: procedure.ref.state,
          })),
        }))
      );
  }

  getAccountTrayStatus(accountId: string) {
    return this.http
      .get<accountTrayStatus>(`${this.URL}/tray-status/${accountId}`)
      .pipe(
        map((resp) => {
          const { inbox, outbox } = resp;
          const statusMap: Record<string, string> = {
            pending: 'Pendiente',
            received: 'Recibido',
            rejected: 'Rechazado',
            'auto-rejected': 'Rechazo automático',
          };
          return {
            inbox: {
              total: inbox.total,
              items: Object.entries(inbox.breakdown).map(([status, count]) => ({
                status: statusMap[status],
                count,
              })),
            },
            outbox: {
              total: outbox.total,
              items: Object.entries(outbox.breakdown).map(
                ([status, count]) => ({
                  status: statusMap[status],
                  count,
                })
              ),
            },
          };
        })
      );
  }

  getUnlinkData() {
    return this.http.get<unlinkDataResponse>(`${this.URL}/unlink`);
  }
}
