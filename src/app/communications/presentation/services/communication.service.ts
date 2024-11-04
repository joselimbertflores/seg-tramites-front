import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
import { OfficerMapper } from '../../../administration/infrastructure';
import { Officer } from '../../../administration/domain';
import { communication } from '../../infrastructure';

interface sendMailProps {
  form: Object;
  recipients: recipient[];
  procedureId: string;
  mailId?: string;
}

export interface onlineAccount {
  accountId: string;
  userId: string;
  officer: Officer;
  jobtitle: string;
  online: boolean;
}

export interface recipient {
  accountId: string;
  fullname: string;
  jobtitle: string;
  isOriginal: boolean;
}

interface filterOutboxProps {
  limit: number;
  offset: number;
  term?: string;
  status?: StatusMail.Pending | StatusMail.Rejected | null;
  isOriginal?: boolean | null;
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
    return this.http.get<institution[]>(`${this.url}/institutions`);
  }

  getDependenciesInInstitution(id_institution: string) {
    return this.http.get<dependencyResponse[]>(
      `${this.url}/dependencies/${id_institution}`
    );
  }

  searchRecipients(term: string): Observable<onlineAccount[]> {
    return this.http.get<account[]>(`${this.url}/recipients/${term}`).pipe(
      map((resp) =>
        resp.map((el) => ({
          accountId: el._id,
          userId: el.user._id,
          officer: OfficerMapper.fromResponse(el.officer!),
          jobtitle: el.jobtitle,
          online: false,
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
    return this.http.get<{ communications: communication[]; length: number }>(
      `${this.url}/inbox`,
      { params }
    );
  }
  getOutbox({ limit, offset, status, isOriginal, term }: filterOutboxProps) {
    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(status && { status }),
        ...(isOriginal !== null && isOriginal !== undefined
          ? { isOriginal }
          : {}),
      },
    });
    return this.http.get<{ communications: communication[]; length: number }>(
      `${this.url}/outbox`,
      { params }
    );
  }

  getOne(id: string) {
    return this.http.get<communication>(`${this.url}/${id}`);
  }

  create({ form, recipients, procedureId, mailId }: sendMailProps) {
    return this.http.post<communication[]>(`${this.url}`, {
      ...form,
      recipients,
      procedureId,
      mailId,
    });
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
