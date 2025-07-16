import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { SearchInputComponent } from '../../../../shared';
import { OfficerDialogComponent } from '../../dialogs';
import { OfficerService } from '../../services';
import { Officer } from '../../../domain';

@Component({
  selector: 'app-officers-manage',
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatToolbarModule,
    SearchInputComponent,
  ],
  templateUrl: './officers-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OfficersManageComponent {
  private officerService = inject(OfficerService);
  private dialogRef = inject(MatDialog);

  readonly displayedColumns = [
    'nombre',
    'dni',
    'telefono',
    'activo',
    'options',
  ];
  dataSource = signal<Officer[]>([]);
  dataSize = signal<number>(0);

  term = signal<string>('');
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.officerService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ officers, length }) => {
        this.dataSource.set(officers);
        this.dataSize.set(length);
      });
  }

  create() {
    const dialogRef = this.dialogRef.open(OfficerDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((result: Officer) => {
      if (!result) return;
      this.dataSource.update((values) =>
        [result, ...values].slice(0, this.limit())
      );
      this.dataSize.update((values) => (values += 1));
    });
  }

  update(item: Officer) {
    const dialogRef = this.dialogRef.open(OfficerDialogComponent, {
      width: '500px',
      data: item,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.dataSource.update((values) => {
        const index = values.findIndex(({ id: _id }) => _id === result._id);
        if (index === -1) return values;
        values[index] = result;
        return [...values];
      });
    });
  }

  search(term: string) {
    this.term.set(term);
    this.index.set(0);
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }
}
