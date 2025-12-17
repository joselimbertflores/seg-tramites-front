import { CommonModule } from '@angular/common';
import { MediaMatcher } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import {
  ChildrenOutletContexts,
  ActivatedRoute,
  RouterModule,
  Router,
} from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';

import {
  AlertService,
  HasPermissionDirective,
  LoadingService,
  overlayAnimation,
  PdfService,
} from '../../../../shared';

import { routeAnimations } from '../../../../shared/animations/route-animations';
import { AuthService } from '../../../../auth/presentation/services/auth.service';
import { ProfileComponent, SidenavMenuComponent } from '../../components';
import { ChatService } from '../../../../chat/presentation/services';
import { SocketService } from '../../services';
import { NewsDialogComponent } from '../../../../publications/presentation/dialogs';
import { CommunicationReportService } from '../../../../reports/presentation/services';
import { finalize, switchMap } from 'rxjs';
import { validResource } from '../../../../auth/infrastructure';

@Component({
  selector: 'app-home',
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    OverlayModule,
    MatBadgeModule,
    ScrollingModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    ProfileComponent,
    SidenavMenuComponent,
    HasPermissionDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeAnimations, overlayAnimation],
})
export default class HomeComponent implements OnDestroy {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  private socketService = inject(SocketService);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private alertservice = inject(AlertService);

  readonly dialogRef = inject(MatDialog);
  isLoading = inject(LoadingService).isLoading;

  public isProfileOpen = false;

  contexts = inject(ChildrenOutletContexts);

  protected isMobile = signal(true);
  private _mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  unreadMessagesCount = signal(0);
  public readonly PERMISSION = validResource;

  constructor(protected route: ActivatedRoute) {
    this.setupLayoutConfig();
    this.setupSocketEvents();
  }

  ngOnInit(): void {
    this.listenUserConnections();
    this.listenKickUser();
    this.listenNews();
    this.listenNewMessages();
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
    this.socketService.disconnect();
  }

  logout() {
    this.socketService.disconnect();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToChat() {
    this.router.navigate(['/home/chat']);
    this.unreadMessagesCount.set(0);
  }

  prepareRoute() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
    ];
  }

  get menu() {
    return this.authService.menu();
  }

  private listenUserConnections(): void {
    this.socketService.listenUserConnections();
  }

  private listenKickUser(): void {
    this.socketService
      .listenKickUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((description) => {
        this.dialogRef.closeAll();
        this.alertservice.messageDialog({
          title: 'Notificación',
          description,
        });
        this.logout();
      });
  }

  private listenNewMessages() {
    this.chatService.listenMessages$.subscribe(() => {
      if (this.router.url !== '/home/chat') {
        this.unreadMessagesCount.update((count) => count + 1);
      }
    });
  }

  private listenNews() {
    this.socketService.listNews().subscribe((publication) => {
      if (publication.user._id === this.authService.user()?.userId) {
        return;
      }
      this.dialogRef.open(NewsDialogComponent, {
        data: [publication],
        minWidth: '900px',
        height: '600px',
      });
    });
  }

  private setupLayoutConfig(): void {
    const media = inject(MediaMatcher);
    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () =>
      this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  private setupSocketEvents(): void {
    this.socketService.connect();
    this.chatService.initChatEvents();
  }

  private reportService = inject(CommunicationReportService);
  private pdfService = inject(PdfService);

  isReportLoading = signal(false);

  generateReport() {
    this.isReportLoading.set(true);
    this.reportService
      .getUnlinkData()
      .pipe(
        switchMap((data) => this.pdfService.unlinkSheet(data)),
        finalize(() => this.isReportLoading.set(false))
      )
      .subscribe((pdf) => {
        pdf.open();
      });
  }
}
