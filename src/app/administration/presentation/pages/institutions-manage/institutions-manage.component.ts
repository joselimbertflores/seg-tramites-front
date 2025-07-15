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

import { SearchInputComponent } from '../../../../shared';
import { InstitutionDialogComponent } from '../../dialogs';
import { institution } from '../../../infrastructure';
import { InstitutionService } from '../../services';

@Component({
  selector: 'app-institutions-manage',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatToolbarModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './institutions-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InstitutionsManageComponent {
  private dialogRef = inject(MatDialog);
  private institutionService = inject(InstitutionService);

  public displayedColumns: string[] = [
    'sigla',
    'nombre',
    'situacion',
    'buttons',
  ];

  dataSource = signal<institution[]>([]);
  dataSize = signal<number>(0);
  term = signal<string>('');

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.institutionService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ institutions, length }) => {
        this.dataSource.set(institutions);
        this.dataSize.set(length);
      });
  }

  create() {
    const dialogRef = this.dialogRef.open(InstitutionDialogComponent, {
      maxWidth: '600px',
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((result?: institution) => {
      if (!result) return;
      this.dataSource.update((values) =>
        [result, ...values].slice(0, this.limit())
      );
      this.dataSize.update((value) => (value += 1));
    });
  }

  update(item: institution) {
    const dialogRef = this.dialogRef.open(InstitutionDialogComponent, {
      maxWidth: '600px',
      width: '600px',
      data: item,
    });
    dialogRef.afterClosed().subscribe((result: institution) => {
      if (!result) return;
      this.dataSource.update((values) => {
        const index = values.findIndex((inst) => inst._id === result._id);
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

  onPageChange(event: PageEvent) {
    this.limit.set(event.pageSize);
    this.index.set(event.pageIndex);
    this.getData();
  }
}
