import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  transferDetails,
  account,
  communicationResponse,
  dependencyResponse,
  institution,
} from '../../../infraestructure/interfaces';
import {
  Communication,
  StateProcedure,
  StatusMail,
} from '../../../domain/models';

import { communication, CommunicationMapper } from '../../infrastructure';
import { communcationStatus, onlineAccount, recipient } from '../../domain';

interface createCommunicationProps {
  form: Object;
  recipients: recipient[];
  procedureId: string;
  communicationId?: string;
}

interface filterOutboxProps {
  limit: number;
  offset: number;
  term?: string;
}

interface filterInboxProps {
  limit: number;
  offset: number;
  filterForm: formInbox;
}
interface formInbox {
  status?: string;
  from?: string;
  group?: string;
  term?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private readonly url = `${environment.base_url}/communication`;
  private http = inject(HttpClient);

  constructor() {}

  getInstitucions() {
    return this.http
      .get<institution[]>(`${this.url}/institutions`)
      .pipe(
        map((resp) => resp.map((el) => ({ value: el._id, label: el.nombre })))
      );
  }

  getDependenciesInInstitution(id_institution: string) {
    return this.http
      .get<dependencyResponse[]>(`${this.url}/dependencies/${id_institution}`)
      .pipe(
        map((resp) => resp.map((el) => ({ value: el._id, label: el.nombre })))
      );
  }

  searchRecipientsAccounts(term: string): Observable<onlineAccount[]> {
    return this.http.get<account[]>(`${this.url}/recipients/${term}`).pipe(
      map((resp) =>
        resp.map(({ _id, user, officer, jobtitle }) => ({
          id: _id,
          userId: user._id,
          fullname: `${officer?.nombre} ${officer?.paterno} ${officer?.materno}`,
          online: false,
          jobtitle,
        }))
      )
    );
  }

  getInbox({ limit, offset, filterForm }: filterInboxProps) {
    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...Object.fromEntries(
          Object.entries(filterForm).filter(([, value]) => value)
        ),
      },
    });
    return this.http
      .get<{ communications: communication[]; length: number }>(
        `${this.url}/inbox`,
        { params }
      )
      .pipe(
        map(({ communications, length }) => ({
          communications: communications.map((el) =>
            CommunicationMapper.fromResponse(el)
          ),
          length,
        }))
      );
  }

  getOutbox({ limit, offset, term }: filterOutboxProps) {
    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
      },
    });
    return this.http
      .get<{ communications: communication[]; length: number }>(
        `${this.url}/outbox`,
        { params }
      )
      .pipe(
        map(({ communications, length }) => ({
          communications: communications.map((el) =>
            CommunicationMapper.fromResponse(el)
          ),
          length,
        }))
      );
  }

  getOne(id: string) {
    return this.http.get<communication>(`${this.url}/${id}`);
  }

  create({ recipients, form, ...props }: createCommunicationProps) {
    return this.http.post<communication[]>(
      `${this.url}`,
      {
        ...form,
        ...props,
        recipients: recipients.map(({ id, isOriginal }) => ({
          accountId: id,
          isOriginal,
        })),
      },
      { headers: { loader: 'true' } }
    );
  }

  accept(communicationIds: string[]) {
    return this.http.put<{ message: string }>(`${this.url}/accept`, {
      communicationIds,
    });
  }

  reject(communicationIds: string[], description: string) {
    return this.http.put<{ message: string }>(`${this.url}/reject`, {
      description,
      communicationIds,
    });
  }

  cancel(communicationIds: string[]) {
    return this.http.delete<{ message: string }>(`${this.url}/outbox`, {
      body: { communicationIds },
    });
  }
}
