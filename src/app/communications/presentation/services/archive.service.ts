import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { archive } from '../../infrastructure/interfaces/archive.interface';
import { map } from 'rxjs';
import { ArchiveMapper } from '../../infrastructure';
import { toSignal } from '@angular/core/rxjs-interop';
import { account } from '../../../administration/infrastructure';

interface createArchiveProps {
  description: string;
  folderId?: string;
  ids: string[];
  state: string;
}

interface findProps {
  folderId: string | null;
  term: string;
  limit: number;
  offset: number;
  accountId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isExport: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  private readonly url = `${environment.base_url}/archives`;
  private http = inject(HttpClient);

  accountInDepepdency = toSignal(
    this.http.get<account[]>(`${this.url}/dependency`).pipe(
      map((resp) =>
        resp.map((el) => ({
          value: el._id,
          label: el.officer
            ? `${el.officer.nombre} ${el.officer.paterno} ${el.officer.materno} (${el.jobtitle})`
            : `SIN ASIGNAR (${el.jobtitle})`,
        }))
      )
    ),
    { initialValue: [] }
  );

  constructor() {}

  create(form: createArchiveProps) {
    return this.http.post<{ message: string; itemIds: string[] }>(
      this.url,
      form
    );
  }

  findAll({
    folderId,
    term,
    limit,
    offset,
    accountId,
    startDate,
    endDate,
    isExport,
  }: findProps) {
    const params = new HttpParams({
      fromObject: {
        ...(folderId && { folder: folderId }),
        ...(term && { term }),
        ...(accountId && { accountId }),
        ...(startDate && { startDate: startDate.toString() }),
        ...(endDate && { endDate: endDate.toString() }),
        isExport,
        limit,
        offset,
      },
    });
    return this.http
      .get<{
        archives: archive[];
        length: number;
        folderName: string;
      }>(this.url, {
        params,
      })
      .pipe(
        map(({ archives, length, folderName }) => ({
          length,
          folderName,
          archives: archives.map((el) => ArchiveMapper.fromResponse(el)),
        }))
      );
  }

  unarchive(id: string) {
    return this.http.delete<{ message: string; id: string }>(
      `${this.url}/${id}`
    );
  }
}
