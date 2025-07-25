import { computed, inject, Injectable, signal } from '@angular/core';

import { AuthService } from '../../../auth/presentation/services/auth.service';
import { validResource } from '../../../auth/infrastructure';

export interface reportMenu {
  label: string;
  link: string;
  description: string;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportCacheService<T> {
  private authService = inject(AuthService);

  lastReportPath = signal<string | null>(null);

  cache: Record<string, T> = {};

  defaultRoute = computed<string | null>(() => {
    const reportResource =
      this.authService.permissions()[validResource.reports];
    if (!reportResource) return null;
    return reportResource.find((action) => action === 'search')
      ? 'home/reports/search'
      : null;
  });

  private readonly permissionMappings: Record<string, reportMenu> = {
    search: {
      label: 'Busquedas',
      link: 'home/reports/search',
      description: 'Buscar cualquier tramite',
      order: 1,
    },
    applicant: {
      label: 'Solicitante',
      link: 'home/reports/applicant',
      description: 'Buscar por contribuyente',
      order: 2,
    },
    unit: {
      label: 'Unidades',
      link: 'home/reports/unit',
      description: 'Listado de tramites pendientes por unidad',
      order: 3,
    },
    segments: {
      label: 'Segmentos',
      link: 'home/reports/segments',
      description: 'Total de tramites agrupado segmento',
      order: 4,
    },
    history: {
      label: 'Historial',
      link: 'home/reports/history',
      description: 'Listado de envios realizados',
      order: 5,
    },
    unlink: {
      label: 'Desvinculacion',
      description: 'Generacion del formulario de baja de usuario',
      link: 'home/reports/unlink',
      order: 6,
    },
    efficiency: {
      label: 'Eficiencia',
      description:
        'Total de tramites finalizados y su promedio en dias habiles',
      link: 'home/reports/efficiency',
      order: 7,
    },
  };

  menu = computed(() => {
    const actions = this.authService.permissions()[validResource.reports] ?? [];
    return actions
      .map((action) => this.permissionMappings[action])
      .filter((item) => !!item).sort((a, b) => a.order - b.order);
  });

  saveCache(key: string, data: T) {
    this.cache[key] = data;
  }

  loadCache(key: string): T | null {
    return this.cache[key] ?? null;
  }
}
