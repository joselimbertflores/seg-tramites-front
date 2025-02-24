import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import { switchMap } from 'rxjs';
import {
  ExternalDetailComponent,
  InternalDetailComponent,
  MailComponent,
} from '../../../components';
import {
  Communication,
  StateProcedure,
  StatusMail,
} from '../../../../domain/models';
import { CacheService, InboxService } from '../../../services';
import { MaterialModule } from '../../../../material.module';
import { InboxCache } from '../../../../communications/presentation/pages/inbox/inbox.component';


@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ExternalDetailComponent,
    InternalDetailComponent,
    MailComponent,
  ],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private inboxService = inject(InboxService);
  private cacheService: CacheService<InboxCache> = inject(CacheService);

  public mail = signal<Communication | null>(null);

  constructor() {}

  ngOnInit(): void {
    this.getMail();
  }

  getMail() {
    this.route.params
      .pipe(switchMap(({ id }) => this.inboxService.getMail(id)))
      .subscribe((comm) => this.mail.set(comm));
  }

  backLocation() {
    this.route.queryParams.subscribe((data) => {
      this.cacheService.pageSize.set(data['limit'] ?? 10);
      this.cacheService.pageIndex.set(data['index'] ?? 0);
      this.cacheService.keepAliveData.set(true);
      this.location.back();
    });
  }

  handleState(state: StateProcedure) {
    const { procedure } = this.mail()!;
    procedure.state = state;
    this.mail.set(this.mail()!.copyWith({ procedure }));
    this.updateItemCache();
  }

  handleAction() {
    switch (this.mail()?.status) {
      case StatusMail.Archived:
        this.removeItemCache();
        this.backLocation();
        break;
      case StatusMail.Rejected:
        this.removeItemCache();
        this.backLocation();
        break;
      case StatusMail.Completed:
        this.removeItemCache();
        this.backLocation();
        break;
      case StatusMail.Received:
        this.updateItemCache();
        break;
      default:
        break;
    }
  }

  private removeItemCache(): void {
    const cache = this.cacheService.load('inbox');
    if (!cache) return;
    const { datasource, datasize, ...props } = cache;
    this.cacheService.save('inbox', {
      ...props,
      datasize: datasize - 1,
      datasource: datasource.filter((el) => el._id !== this.mail()?._id),
    });
  }

  private updateItemCache(): void {
    const cache = this.cacheService.load('inbox');
    if (!cache) return;
    const { datasource, ...props } = cache;
    const index = datasource.findIndex((el) => el._id === this.mail()?._id);
    datasource[index] = this.mail()!;
    this.cacheService.save('inbox', { ...props, datasource });
  }
}
