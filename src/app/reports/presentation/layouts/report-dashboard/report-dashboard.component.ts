import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
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
import { filter, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private destroyRef = inject(DestroyRef);
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
    this.listenReportRoutes();
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
    this.bottomSheet.open(ReportListComponent, { hasBackdrop: true, autoFocus:false });
  }

  private listenReportRoutes() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        this.reportCacheService.setLastReportPath(url);
      });
  }
}
