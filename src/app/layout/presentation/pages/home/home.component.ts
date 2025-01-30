import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  ChildrenOutletContexts,
  Data,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { map, shareReplay } from 'rxjs';
import { SocketService, AuthService } from '../../../../presentation/services';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  NavigationListComponent,
  SidenavButtonComponent,
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
import { AlertService, CacheService } from '../../../../shared';
import { routeAnimations } from '../../../../../slideInAnimation';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    NavigationListComponent,
    SidenavButtonComponent,
    ProfileComponent,
    MatSidenavModule,
    RouterModule,
    OverlayModule,
    MatButtonModule,
    ScrollingModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeAnimations],
})
export default class HomeComponent implements AfterViewInit, AfterViewChecked {
  private breakpointObserver = inject(BreakpointObserver);
  private socketService = inject(SocketService);
  private alertservice = inject(AlertService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  readonly dialogRef = inject(MatDialog);

  public detailsOpen = false;
  public isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  contexts = inject(ChildrenOutletContexts);

  @ViewChild(CdkScrollable) matContent!: CdkScrollable;
  private cacheService = inject(CacheService);

  constructor(
    protected route: ActivatedRoute,
    private scrollDispatcher: ScrollDispatcher
  ) {
    this.destroyRef.onDestroy(() => {
      this.socketService.disconnect();
    });

    // Escuchar eventos de navegación
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationStart) {
    //     const currentRoute = this.getActiveChildRoute(this.route);
    //     if (currentRoute === 'folders') {
    //       // Guardar la posición actual del scroll
    //       const scrollPosition =
    //         this.matContent.getElementRef().nativeElement.scrollTop;
    //       sessionStorage.setItem('scroll-app', scrollPosition.toString());
    //     }
    //   }

    //   if (event instanceof NavigationEnd) {
    //     const currentRoute = this.getActiveChildRoute(this.route);
    //     if (currentRoute === 'folders') {
    //       // Restablecer la posición del scroll después de un breve retraso
    //       // setTimeout(() => {
    //       //   this.matContent.getElementRef().nativeElement.scrollTo({
    //       //     top: parseInt(position, 10),
    //       //     behavior: 'smooth',
    //       //   });
    //       // }, 100); // Retraso de 100 ms para asegurar que el DOM esté listo
    //     }
    //   }
    // });
    // this.cacheService.scrollEvent$.subscribe(() => {
    //   const position = sessionStorage.getItem('scroll-app') ?? '0';
    //   setTimeout(() => {
    //     this.matContent.getElementRef().nativeElement.scrollTo({
    //       top: parseInt(position, 10),
    //       behavior: 'smooth',
    //     });
    //   }, 10);
    // });
  }
  ngAfterViewChecked(): void {}
  ngAfterViewInit(): void {}

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

  private getActiveChildRoute(route: ActivatedRoute): string {
    let child = route;
    while (child.firstChild) {
      child = child.firstChild;
    }
    return child.snapshot.routeConfig?.path || '';
  }
}
