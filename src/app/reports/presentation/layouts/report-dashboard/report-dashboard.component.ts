import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../../../auth/presentation/services/auth.service';
import { RestoreScrollDirective } from '../../../../shared';

interface menu {
  label: string;
  link: string;
  description: string;
}
@Component({
  selector: 'app-report-dashboard',
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    RestoreScrollDirective,
  ],
  templateUrl: './report-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly permissionMappings: Record<string, menu> = {
    search: {
      label: 'Busquedas',
      link: 'search',
      description: 'Buscar cualquier tramite',
    },
    applicants: {
      label: 'Solicitante',
      link: 'applicant',
      description: 'Buscar por contribuyente',
    },
    // dependents: {
    //   label: 'Dependientes',
    //   link: 'dependents',
    //   description: 'Listado de unidad',
    // },
    // unit: {
    //   label: 'Unidades',
    //   link: 'unit',
    //   description: 'Listado por unidad',
    // },
  };
  public menu = signal<menu[]>([]);
  private router = inject(Router);
  isLoading = signal<boolean>(false);

  constructor() {}

  ngOnInit(): void {
    this._loadMenu();
  }

  private _loadMenu() {
    // const menu = this.authService
    //   .permissions()
    //   [VALID_RESOURCES.reports].map((action) => this.permissionMappings[action])
    //   .filter((item) => item);
    // this.menu.set(menu);
    this.menu.set(Object.values(this.permissionMappings));
  }

  navigateTo(url: string, drawerRef: MatDrawer) {
    this.router.navigateByUrl(`home/reports/${url}`);
    drawerRef.close();
  }
}
