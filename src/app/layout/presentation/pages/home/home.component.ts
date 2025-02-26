import {
  BreakpointObserver,
  Breakpoints,
  MediaMatcher,
} from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  ChildrenOutletContexts,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { map, shareReplay } from 'rxjs';
import {
  SocketService,
  AuthService,
  AppearanceService,
} from '../../../../presentation/services';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  NavigationListComponent,
  ProfileComponent,
} from '../../../../presentation/components';
import { MatSidenavModule } from '@angular/material/sidenav';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import {
  CdkScrollable,
  ScrollDispatcher,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { PublicationDialogComponent } from '../../../../publications/presentation/components';
import {
  AlertService,
  CacheService,
  ProgressBarComponent,
} from '../../../../shared';
import { routeAnimations } from '../../../../../slideInAnimation';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    NavigationListComponent,
    ProfileComponent,
    MatSidenavModule,
    RouterModule,
    OverlayModule,
    MatButtonModule,
    ScrollingModule,
    MatTooltipModule,
    ProgressBarComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeAnimations],
})
export default class HomeComponent {
  private socketService = inject(SocketService);
  private alertservice = inject(AlertService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  isAppLoading = inject(AppearanceService).isAppLoading;

  readonly dialogRef = inject(MatDialog);

  public isProfileOpen = false;

  contexts = inject(ChildrenOutletContexts);

  @ViewChild(CdkScrollable) matContent!: CdkScrollable;

  protected readonly isMobile = signal(true);
  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  constructor(protected route: ActivatedRoute) {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () =>
      this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.destroyRef.onDestroy(() => {
      this.socketService.disconnect();
      this._mobileQuery.removeEventListener(
        'change',
        this._mobileQueryListener
      );
    });
  }

  ngOnInit(): void {
    this.listenUserConnections();
    this.handleExpelClient();
    this.handleCommunications();
    this.socketService.listNews().subscribe((pub) => {
      this.dialogRef.open(PublicationDialogComponent, {
        data: [pub],
        minWidth: '900px',
        height: '600px',
      });
    });
  }

  logout() {
    this.socketService.disconnect();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRouteAnimationData(): string {
    const context = this.contexts.getContext('primary');
    const route = context?.route?.snapshot;
    return route?.data?.['animation'] || route?.component?.name || 'default';
  }

  private listenUserConnections(): void {
    this.socketService.listenUserConnections();
  }

  private handleExpelClient(): void {
    this.socketService
      .listExpel()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.alertservice.Alert({
          icon: 'info',
          title: 'Usted ha sido expulsado',
          text: message,
        });
        this.logout();
      });
  }

  private handleCommunications(): void {
    // this.socketService
    //   .listenProceduresDispatches()
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe((data) =>
    //     this.alertservice.Toast({
    //       title: `${data.emitter.fullname} ha enviado un tramite`,
    //       message: data.reference,
    //     })
    //   );
  }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }

  get menu() {
    return this.authService.menu();
  }
}
