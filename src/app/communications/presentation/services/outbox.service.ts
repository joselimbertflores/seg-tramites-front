import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map } from 'rxjs';

import { communication } from '../../../communications/infrastructure';
import { environment } from '../../../../environments/environment';

interface createCommunicationProps {
  procedureId: string;
  attachmentsCount: string;
  reference: string;
  internalNumber: string;
  recipients: recipient[];
  communicationId: string;
  documentId?: string;
}

interface recipient {
  accountId: string;
  isOriginal: boolean;
}

type communicationMode = 'initiate' | 'forward' | 'resend';
@Injectable({
  providedIn: 'root',
})
export class OutboxService {
  private readonly url = `${environment.base_url}/communication`;
  constructor(private http: HttpClient) {}

  findAll(limit: number, offset: number) {
    const params = new HttpParams({ fromObject: { limit, offset } });
    return this.http.get<{ mails: communication[]; length: number }>(
      `${this.url}/outbox`,
      {
        params,
      }
    );
  }

  cancel(selected: any[]) {
    return this.http.delete<{ message: string }>(`${this.url}/outbox`, {
      body: { selected },
    });
  }

  create(data: createCommunicationProps, mode: communicationMode) {
    return this.http.post<communication[]>(`${this.url}/${mode}`, data, {
      headers: { loader: 'true' },
    });
  }
}
