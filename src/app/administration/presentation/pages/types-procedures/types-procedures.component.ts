import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { TypeProcedureComponent } from './type-procedure/type-procedure.component';
import { SearchInputComponent } from '../../../../shared';
import { typeProcedure } from '../../../infrastructure';
import { TypeProcedureService } from '../../services';

@Component({
    selector: 'app-types-procedures',
    imports: [
        CommonModule,
        MatToolbarModule,
        MatDialogModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
        SearchInputComponent,
    ],
    templateUrl: './types-procedures.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class TypesProceduresComponent {
  private dialog = inject(MatDialog);
  private typeProcedureService = inject(TypeProcedureService);

  displayedColumns = ['name', 'area', 'isActive', 'menu'];
  datasource = signal<typeProcedure[]>([]);
  datasize = signal<number>(0);
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  term = signal<string>('');

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.typeProcedureService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ types, length }) => {
        this.datasource.set(types);
        this.datasize.set(length);
      });
  }

  create(): void {
    const dialogRef = this.dialog.open(TypeProcedureComponent, {
      minWidth: '800px',
    });
    dialogRef.afterClosed().subscribe((result: typeProcedure) => {
      if (!result) return;
      this.datasource.update((values) => {
        if (values.length === this.limit()) values.pop();
        return [result, ...values];
      });
      this.datasize.update((values) => (values += 1));
    });
  }

  update(type: typeProcedure): void {
    const dialogRef = this.dialog.open(TypeProcedureComponent, {
      minWidth: '800px',
      data: type,
    });
    dialogRef.afterClosed().subscribe((result: typeProcedure) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex((value) => value._id === result._id);
        values[index] = result;
        return [...values];
      });
    });
  }

  search(term: string) {
    this.index.set(0);
    this.term.set(term);
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }
}
