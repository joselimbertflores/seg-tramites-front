import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import {
  dependency,
  institution,
} from '../../../administration/infrastructure';

@Injectable({
  providedIn: 'root',
})
export class CommonReportService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/report-common`;

  constructor() {}

  getInstitutions() {
    return this.http.get<institution[]>(`${this.URL}/institutions`);
  }

  getDependencies(institutionId: string) {
    return this.http.get<dependency[]>(`${this.URL}/dependencies/${institutionId}`);
  }
}
