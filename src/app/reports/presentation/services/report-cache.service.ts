import { computed, inject, Injectable, signal } from '@angular/core';

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
export class ReportCacheService<T> {
  private authService = inject(AuthService);

  lastReportPath = signal<string | null>(null);

  cache: Record<string, T> = {};

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
      description: 'Total de tramites agrupado segmento',
    },
    history: {
      label: 'Historial',
      link: 'home/reports/history',
      description: 'Listado de envios realizados',
    },
    unlink: {
      label: 'Desvinculacion',
      description: 'Generacacion del formulario de baja de usuario',
      link: 'home/reports/unlink',
    },
  };

  menu = computed(() => {
    const actions = this.authService.permissions()[validResource.reports] ?? [];
    return actions
      .map((action) => this.permissionMappings[action])
      .filter((item) => !!item);
  });

  saveCache(key: string, data: T) {
    this.cache[key] = data;
  }

  loadCache(key: string): T | null {
    return this.cache[key] ?? null;
  }
}
