import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';

import { SocketService } from '../../services';
import { IUserSocket } from '../../../infrastructure';
import { AlertService } from '../../../../shared';

@Component({
  selector: 'app-groupware',
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatPaginatorModule,
  ],
  templateUrl: './groupware.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GroupwareComponent {
  private socketService = inject(SocketService);
  private alertService = inject(AlertService);

  onlineUsers = toSignal(this.socketService.onlineClients$, {
    initialValue: [],
  });

  displayedColumns: string[] = ['select', 'user', 'sessions', 'options'];
  dataSource = computed(
    () => new MatTableDataSource<IUserSocket>(this.onlineUsers())
  );

  selection = new SelectionModel<IUserSocket>(true, []);
  paginator = viewChild.required(MatPaginator);

  constructor() {
    effect(() => {
      this.dataSource().paginator = this.paginator();
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource().data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource().data);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
  }

  kickSelectedUsers() {
    this.kickUsers(this.selection.selected);
    this.selection.clear()
  }

  kickUsers(users: IUserSocket[]) {
    if (users.length === 0) return;
    this.alertService
      .descriptionDialog(
        users.length > 1
          ? {
              title: '¿Expulsar los usuarios seleccionados?',
              placeholder:
                'Ingrese una descripcion del motivo de la expulsion. (Los usuarios podran ver este mensaje)',
            }
          : {
              title: `¿Expulsar a ${users[0].fullname
                .toLowerCase()
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}?`,
              placeholder:
                'Ingrese una descripcion del motivo de la expulsion. (El usuario podra ver este mensaje)',
            }
      )
      .subscribe((message) => {
        if (!message) return;
        this.socketService.kickUsers(
          users.map(({ userId }) => userId),
          message
        );
      });
  }
}
