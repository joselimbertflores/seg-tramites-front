import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { RoleDialogComponent } from '../../dialogs';
import { role } from '../../../infrastructure';
import { RoleService } from '../../services';
import { SearchInputComponent } from '../../../../shared';

@Component({
  selector: 'app-roles-manage',
  imports: [
    CommonModule,
    MatTableModule,
    MatToolbarModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    SearchInputComponent
  ],
  templateUrl: './roles-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RolesManageComponent {
  private dialog = inject(MatDialog);
  private roleService = inject(RoleService);

  readonly displayedColumns = ['rol', 'permissions', 'options'];
  term = signal<string>('');
  dataSource = signal<role[]>([]);
  dataSize = signal(0);
  limit = signal(10);
  index = signal(0);
  offset = computed<number>(() => this.limit() * this.index());

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.roleService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ roles, length }) => {
        this.dataSource.set(roles);
        this.dataSize.set(length);
      });
  }

  search(term:string){
    this.term.set(term)
    this.index.set(0)
    this.getData()
  }

  create(): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      maxWidth: '500px',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((result?: role) => {
      if (!result) return;
      this.dataSource.update((values) =>
        [result, ...values].slice(0, this.limit())
      );
      this.dataSize.update((value) => (value += 1));
    });
  }

  update(role: role): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      data: role,
      maxWidth: '500px',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((result?: role) => {
      if (!result) return;
      this.dataSource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === result._id);
        if (index === -1) return values;
        values[index] = result;
        return [...values];
      });
    });
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }
}
