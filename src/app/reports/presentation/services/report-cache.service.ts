import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReportCacheService {
  private lastReportPath: string | null = null;

  constructor() {}

  setLastReportPath(path: string) {
    this.lastReportPath = path;
  }

  getLastReportPath(): string | null {
    return this.lastReportPath;
  }
}
