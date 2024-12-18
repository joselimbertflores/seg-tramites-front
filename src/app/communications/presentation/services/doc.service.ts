import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private readonly url = `${environment.base_url}/process`;

  constructor() {}
}
