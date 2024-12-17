import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RoleService } from '../../services/role.service';
import { RoleDialogComponent } from './role-dialog/role-dialog.component';

import { role } from '../../../infrastructure';

@Component({
    selector: 'app-roles-manage',
    imports: [
        CommonModule,
        MatTableModule,
        MatToolbarModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
    ],
    templateUrl: './roles-manage.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RolesManageComponent {
  private dialog = inject(MatDialog);
  private roleService = inject(RoleService);

   datasource = signal<role[]>([]);
   displayedColumns: string[] = ['rol', 'options'];

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.roleService.findAll().subscribe((resp) => {
      this.datasource.set(resp.roles);
    });
  }

  add(): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      maxWidth: '600px',
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((result?: role) => {
      if (!result) return;
      this.datasource.update((values) => [result, ...values]);
    });
  }

  edit(role: role) {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      data: role,
      maxWidth: '600px',
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((result: role) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === result._id);
        values[index] = result;
        return [...values];
      });
    });
  }
}
