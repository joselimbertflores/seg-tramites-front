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

import { InstitutionDialogComponent } from './institution-dialog/institution-dialog.component';
import { institution } from '../../../infrastructure';
import { InstitutionService } from '../../services';



@Component({
    selector: 'app-institutions-manage',
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
        MatTableModule,
        MatToolbarModule
    ],
    templateUrl: './institutions-manage.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class InstitutionsManageComponent {
  dialog = inject(MatDialog);
  institutionService = inject(InstitutionService);

  public displayedColumns: string[] = [
    'sigla',
    'nombre',
    'situacion',
    'buttons',
  ];

  datasource = signal<institution[]>([]);
  datasize = signal<number>(0);

  public limit = signal<number>(10);
  public index = signal<number>(0);
  public offset = computed<number>(() => this.limit() * this.index());

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.institutionService
      .get(this.limit(), this.offset())
      .subscribe((data) => {
        this.datasource.set(data.institutions);
        this.datasize.set(data.length);
      });
  }

  add() {
    const dialogRef = this.dialog.open(InstitutionDialogComponent);
    dialogRef.afterClosed().subscribe((result?: institution) => {
      if (!result) return;
      this.datasource.update((values) => [result, ...values]);
      this.datasize.update((value) => (value += 1));
    });
  }

  edit(data: institution) {
    const dialogRef = this.dialog.open(InstitutionDialogComponent, {
      maxWidth: '700px',
      data,
    });
    dialogRef.afterClosed().subscribe((result: institution) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex((inst) => inst._id === result._id);
        values[index] = result;
        return [...values];
      });
    });
  }

  onPageChange(event: PageEvent) {
    this.limit.set(event.pageSize);
    this.index.set(event.pageIndex);
    this.getData();
  }
}
