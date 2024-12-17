import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { SidenavButtonComponent } from '../../../components';
import { AlertService, SocketService } from '../../../services';
import { SocketClient } from '../../../../infraestructure/interfaces';

@Component({
    selector: 'app-clients',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SidenavButtonComponent,
    ],
    templateUrl: './clients.component.html',
    styleUrl: './clients.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent implements OnInit {
  private socketService = inject(SocketService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  filterCtrl = new FormControl('');
  filteredClients: Observable<SocketClient[]>;

  constructor() {}

  ngOnInit(): void {
    this.filteredClients = this.filterCtrl.valueChanges.pipe(
      startWith(''),
      switchMap((term) => this._filter(term))
    );
  }

  confirmRemove(client: SocketClient) {
    this.alertService.ConfirmAlert({
      title: `¿Expulsar al funcionario ${client.fullname}?`,
      text: `SESIONES ABIERTAS: ${client.socketIds.length}`,
      callback: (result) => {
        this._remove(client, result);
      },
    });
  }

  private _remove(client: SocketClient, message: string) {
    this.socketService.expelClient(client.userId, message);
  }

  private _filter(term: string | null) {
    return this.socketService.onlineClients$.pipe(
      map((clients) => {
        if (!term) return clients;
        return clients.filter(({ fullname }) =>
          fullname.toLowerCase().includes(term.toLowerCase())
        );
      })
    );
  }
}
