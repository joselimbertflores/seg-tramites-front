import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { totalCommunicationsByUnitResponse } from '../../infrastructure';
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

@Injectable({
  providedIn: 'root',
})
export class CommunicationReportService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/report-communications`;
  constructor() {}

  getTotalDependents({
    startDate,
    endDate,
    ...props
  }: totalCommunicationsByUnitParams) {
    const body = {
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      ...props,
    };
    return this.http
      .post<totalCommunicationsByUnitResponse[]>(
        `${this.URL}/dependents`,
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
}
