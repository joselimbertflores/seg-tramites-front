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
import { CreateCommunicationDto } from '../../../infraestructure/dtos';
import { OfficerMapper } from '../../../administration/infrastructure';
import { Officer } from '../../../administration/domain';
import { communication } from '../../infrastructure';

interface SearchParams {
  text: string;
  limit: number;
  offset: number;
  status?: StatusMail;
}

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

@Injectable({
  providedIn: 'root',
})
export class InboxService {
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

  create({ form, recipients, procedureId, mailId }: sendMailProps) {
    return this.http.post<communication[]>(`${this.url}`, {
      ...form,
      recipients,
      procedureId,
      mailId,
    });
  }

  findAll(limit: number, offset: number, status?: StatusMail) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(status && { status }) },
    });
    return this.http.get<{ mails: communication[]; length: number }>(
      `${this.url}/inbox`,
      { params }
    );
  }
  search({ status, text, ...values }: SearchParams) {
    const params = new HttpParams({
      fromObject: { ...values, ...(status && { status }) },
    });
    return this.http
      .get<{ mails: communicationResponse[]; length: number }>(
        `${this.url}/inbox/search/${text}`,
        {
          params,
        }
      )
      .pipe(
        map((resp) => {
          return {
            mails: resp.mails.map((el) => Communication.fromResponse(el)),
            length: resp.length,
          };
        })
      );
  }

  getMail(id: string) {
    return this.http
      .get<communicationResponse>(`${this.url}/${id}`)
      .pipe(map((resp) => Communication.fromResponse(resp)));
  }

  accept(id: string) {
    return this.http.put<{ message: string }>(`${this.url}/accept/${id}`, null);
  }

  reject(id: string, description: string) {
    return this.http.put<{ message: string }>(`${this.url}/reject/${id}`, {
      description,
    });
  }
}
