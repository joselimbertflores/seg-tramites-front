import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { SearchInputComponent } from '../../../../shared';
import { DependencyService } from '../../services';
import { dependency } from '../../../infrastructure';
import { DependencyDialogComponent, PersonnelDialogComponent } from '../../dialogs';

@Component({
  selector: 'app-dependencies-manage',
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatDialogModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './dependencies-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DependenciesManageComponent {
  private dialog = inject(MatDialog);
  private dependencyService = inject(DependencyService);

  term = signal<string>('');
  dataSource = signal<dependency[]>([]);
  dataSize = signal<number>(0);

  readonly displayedColumns = [
    'institucion',
    'nombre',
    'codigo',
    'active',
    'options',
  ];
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.dependencyService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe((data) => {
        this.dataSource.set(data.dependencies);
        this.dataSize.set(data.length);
      });
  }

  create() {
    const dialogRef = this.dialog.open(DependencyDialogComponent, {
      width: '800px',
      maxWidth: '800px',
    });
    dialogRef.afterClosed().subscribe((result: dependency) => {
      if (!result) return;
      this.dataSource.update((values) =>
        [result, ...values].slice(0, this.limit())
      );
      this.dataSize.update((value) => (value += 1));
    });
  }

  update(item: dependency) {
    const dialogRef = this.dialog.open(DependencyDialogComponent, {
      width: '800px',
      maxWidth: '800px',
      data: item,
    });
    dialogRef.afterClosed().subscribe((dependency: dependency) => {
      if (!dependency) return;
      this.dataSource.update((values) => {
        const index = values.findIndex((inst) => inst._id === dependency._id);
        if (index === -1) return values;
        values[index] = dependency;
        return [...values];
      });
    });
  }

  viewPersonnel(data: dependency) {
    this.dialog.open(PersonnelDialogComponent, {
      width: '900px',
      maxWidth: '900px',
      data,
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
