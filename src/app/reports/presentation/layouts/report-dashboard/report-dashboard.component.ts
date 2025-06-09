import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../auth/presentation/services/auth.service';
import { RestoreScrollDirective } from '../../../../shared';
import { ReportListComponent } from '../../components';
import { ReportCacheService } from '../../services';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-report-dashboard',
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    RestoreScrollDirective,
  ],
  templateUrl: './report-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private reportCacheService = inject(ReportCacheService);
  private readonly permissionMappings: Record<string, any> = {
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  isLoading = signal<boolean>(false);

  private bottomSheet = inject(MatBottomSheet);

  constructor() {}

  ngOnInit(): void {
    this.loadMenu();
    this.navigateToLastReport();
  }

  private loadMenu() {
    // const menu = this.authService
    //   .permissions()
    //   [VALID_RESOURCES.reports].map((action) => this.permissionMappings[action])
    //   .filter((item) => item);
    // this.menu.set(menu);
    // this.menu.set(Object.values(this.permissionMappings));
  }

  openBottomSheet(): void {
    this.bottomSheet.open(ReportListComponent, { hasBackdrop: true });
  }

  private navigateToLastReport() {
    const lastPath = this.reportCacheService.getLastReportPath();
    if (this.route.snapshot.children.length === 0) {
      if (lastPath) {
        this.router.navigateByUrl(lastPath, { replaceUrl: true });
      } else {
        this.router.navigate(['home'], { relativeTo: this.route });
      }
    }
  }
}
