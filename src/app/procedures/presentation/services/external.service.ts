import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExternalProcedureDto } from '../../../infraestructure/dtos';
import { ExternalProcedure } from '../../../domain/models';
import {
  externalResponse,
  typeProcedureResponse,
} from '../../../infraestructure/interfaces';
import { external, ExternalMapper } from '../../infrastructure';

interface externalProps {
  formProcedure: Object;
  formApplicant: Object;
  formRepresentative: Object;
  requirements?: string[];
}
@Injectable({
  providedIn: 'root',
})
export class ExternalService {
  private readonly base_url = `${environment.base_url}/external`;
  constructor(private http: HttpClient) {}

  getSegments() {
    return this.http.get<string[]>(`${this.base_url}/segments`);
  }

  getTypesProceduresBySegment(segment: string) {
    return this.http.get<typeProcedureResponse[]>(
      `${this.base_url}/types-procedures/${segment}`
    );
  }

  findAll(limit: number, offset: number) {
    const params = new HttpParams({ fromObject: { limit, offset } });
    return this.http
      .get<{ procedures: external[]; length: number }>(`${this.base_url}`, {
        params,
      })
      .pipe(
        map(({ procedures, length }) => ({
          procedures: procedures.map((item) =>
            ExternalMapper.fromResponse(item)
          ),
          length,
        }))
      );
  }

  create({
    formApplicant,
    formProcedure,
    formRepresentative,
    requirements,
  }: externalProps) {
    return this.http
      .post<external>(`${this.base_url}`, {
        ...formProcedure,
        requirements,
        applicant: formApplicant,
        representative:
          Object.keys(formRepresentative).length > 0
            ? formRepresentative
            : null,
      })
      .pipe(map((response) => ExternalMapper.fromResponse(response)));
  }

  update(
    id: string,
    { formProcedure, formApplicant, formRepresentative }: externalProps
  ) {
    return this.http
      .patch<external>(`${this.base_url}/${id}`, {
        ...formProcedure,
        applicant: formApplicant,
        representative:
          Object.keys(formRepresentative).length > 0
            ? formRepresentative
            : null,
      })
      .pipe(map((response) => ExternalMapper.fromResponse(response)));
  }

  getOne(id: string) {
    return this.http
      .get<external>(`${this.base_url}/${id}`)
      .pipe(map((response) => ExternalMapper.fromResponse(response)));
  }
}
