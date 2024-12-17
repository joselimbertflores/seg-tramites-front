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

import { OfficerDialogComponent } from './officer-dialog/officer-dialog.component';
import { SearchInputComponent } from '../../../../shared';
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class OfficersManageComponent {
  private officerService = inject(OfficerService);
  private dialog = inject(MatDialog);

  public datasource = signal<Officer[]>([]);
  public datasize = signal<number>(0);

  term = signal<string>('');
  public limit = signal<number>(10);
  public index = signal<number>(0);
  public offset = computed<number>(() => this.limit() * this.index());
  public displayedColumns = ['nombre', 'dni', 'telefono', 'activo', 'options'];

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.officerService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ officers, length }) => {
        this.datasource.set(officers);
        this.datasize.set(length);
      });
  }

  create() {
    const dialogRef = this.dialog.open(OfficerDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((result: Officer) => {
      if (!result) return;
      this.datasource.update((values) => {
        if (values.length === this.limit()) values.pop();
        return [result, ...values];
      });
      this.datasize.update((values) => (values += 1));
    });
  }

  edit(officer: Officer) {
    const dialogRef = this.dialog.open(OfficerDialogComponent, {
      width: '500px',
      data: officer,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === result._id);
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
