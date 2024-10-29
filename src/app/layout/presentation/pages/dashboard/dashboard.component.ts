import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { map, shareReplay } from 'rxjs';
import {
  SocketService,
  AlertService,
  AuthService,
} from '../../../../presentation/services';
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
import { PublicationDialogComponent } from '../../../../publications/presentation/components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent {
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

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.socketService.disconnect();
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

  get menu() {
    return this.authService.menu();
  }
}
