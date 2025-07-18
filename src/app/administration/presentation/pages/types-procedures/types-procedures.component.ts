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

import { SearchInputComponent } from '../../../../shared';
import { typeProcedure } from '../../../infrastructure';
import { TypeProcedureService } from '../../services';
import { TypeProcedureDialogComponent } from '../../dialogs';

@Component({
  selector: 'app-types-procedures',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatToolbarModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './types-procedures.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TypesProceduresComponent {
  private dialogRef = inject(MatDialog);
  private typeProcedureService = inject(TypeProcedureService);

  readonly displayedColumns = ['name', 'area', 'isActive', 'menu'];
  dataSource = signal<typeProcedure[]>([]);
  dataSize = signal<number>(0);
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
        this.dataSource.set(types);
        this.dataSize.set(length);
      });
  }

  create(): void {
    const dialogRef = this.dialogRef.open(TypeProcedureDialogComponent, {
      width: '900px',
      maxWidth: '900px',
    });
    dialogRef.afterClosed().subscribe((result: typeProcedure) => {
      if (!result) return;
      this.dataSource.update((values) => [result, ...values].slice(0, this.limit()));
      this.dataSize.update((values) => (values += 1));
    });
  }

  update(item: typeProcedure): void {
    const dialogRef = this.dialogRef.open(TypeProcedureDialogComponent, {
      width: '900px',
      maxWidth: '900px',
      data: item,
    });
    dialogRef.afterClosed().subscribe((result: typeProcedure) => {
      if (!result) return;
      this.dataSource.update((values) => {
        const index = values.findIndex((value) => value._id === result._id);
        if (index === -1) return values;
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
