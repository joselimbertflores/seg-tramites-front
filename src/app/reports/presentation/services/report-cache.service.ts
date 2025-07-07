import { computed, inject, Injectable } from '@angular/core';

import { AuthService } from '../../../auth/presentation/services/auth.service';
import { validResource } from '../../../auth/infrastructure';

export interface reportMenu {
  label: string;
  link: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportCacheService {
  private authService = inject(AuthService);
  private lastReportPath: string | null = null;

  private readonly permissionMappings: Record<string, reportMenu> = {
    search: {
      label: 'Busquedas',
      link: 'home/reports/search',
      description: 'Buscar cualquier tramite',
    },
    applicant: {
      label: 'Solicitante',
      link: 'home/reports/applicant',
      description: 'Buscar por contribuyente',
    },
    unit: {
      label: 'Unidades',
      link: 'home/reports/unit',
      description: 'Listado de tramites pendientes por unidad',
    },
    segments: {
      label: 'Segmentos',
      link: 'home/reports/segments',
      description: 'Total de tramites por segmento',
    },
  };

  menu = computed(() => {
    const actions = this.authService.permissions()[validResource.reports] ?? [];
    return actions
      .map((action) => this.permissionMappings[action])
      .filter((item) => !!item);
  });

  constructor() {
    console.log(this.authService.user());
  }

  setLastReportPath(path: string) {
    this.lastReportPath = path;
  }

  getLastReportPath(): string | null {
    return this.lastReportPath;
  }
}
