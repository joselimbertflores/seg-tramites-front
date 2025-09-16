import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthService } from '../../../auth/presentation/services/auth.service';
import { validResource } from '../../../auth/infrastructure';

export interface ReportItem {
  label: string;
  route: string;
  description: string;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportCacheService<T> {
  private permissions = inject(AuthService).permissions;
  private actions = computed<string[] | null>(
    () => this.permissions()[validResource.reports]
  );
  private readonly permissionMappings: Record<string, ReportItem> = {
    search: {
      label: 'Busquedas',
      route: '/home/reports/search',
      description: 'Buscar cualquier tramite',
      order: 1,
    },
    applicant: {
      label: 'Solicitante',
      route: '/home/reports/applicant',
      description: 'Buscar por contribuyente',
      order: 2,
    },
    unit: {
      label: 'Unidades',
      route: '/home/reports/unit',
      description: 'Cantidad de tramites (enviados / recibidos) por unidad',
      order: 3,
    },
    segments: {
      label: 'Segmentos',
      route: '/home/reports/segments',
      description: 'Total de tramites agrupado segmento',
      order: 4,
    },
    history: {
      label: 'Historial',
      route: '/home/reports/history',
      description: 'Listado de envios realizados',
      order: 5,
    },
    unlink: {
      label: 'Desvinculacion',
      description: 'Generacion del formulario de baja de usuario',
      route: '/home/reports/unlink',
      order: 6,
    },
    efficiency: {
      label: 'Eficiencia',
      description: 'Total de tramites archivados y su promedio en dias habiles',
      route: '/home/reports/efficiency',
      order: 7,
    },
    unit_correspondence_status: {
      label: 'Estado correspondencia por unidad',
      description: 'Total de tramites en bandejas',
      route: '/home/reports/correspondence-status',
      order: 8,
    },
  };

  cache: Record<string, T> = {};

  menu = computed(() => {
    const actions = this.actions() ?? [];
    return actions
      .map((action) => this.permissionMappings[action])
      .filter((item) => !!item)
      .sort((a, b) => a.order - b.order);
  });

  private _currentReport = signal<ReportItem | null>(this.getDefaultReport());
  currentReport = computed(() => this._currentReport());

  saveCache(key: string, data: T) {
    this.cache[key] = data;
  }

  loadCache(key: string): T | null {
    return this.cache[key] ?? null;
  }

  setCurrentReport(item: ReportItem) {
    this._currentReport.set(item);
  }

  setCurrentReportByRoute(route: string) {
    const item =
      Object.values(this.permissionMappings).find(
        (item) => item.route === route
      ) ?? null;
    this._currentReport.set(item);
  }

  private getDefaultReport(): ReportItem | null {
    return this.actions()?.find((item) => item === 'search')
      ? this.permissionMappings['search']
      : null;
  }
}
