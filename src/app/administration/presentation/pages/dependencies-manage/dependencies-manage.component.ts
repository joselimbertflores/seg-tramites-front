import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

import { DependencyDialogComponent } from './dependency-dialog/dependency-dialog.component';
import { SearchInputComponent } from '../../../../shared';
import { DependencyService } from '../../services';
import { dependency } from '../../../infrastructure';

@Component({
    selector: 'app-dependencies-manage',
    imports: [
        FormsModule,
        MatToolbarModule,
        MatDialogModule,
        MatInputModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
        SearchInputComponent,
    ],
    templateUrl: './dependencies-manage.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class DependenciesManageComponent {
  private dialog = inject(MatDialog);
  private dependencyService = inject(DependencyService);

  term = signal<string>('');
  datasource = signal<dependency[]>([]);
  datasize = signal<number>(10);

  readonly displayedColumns = [
    'sigla',
    'nombre',
    'codigo',
    'institucion',
    'activo',
    'menu',
  ];
  public limit = signal<number>(10);
  public index = signal<number>(0);
  public offset = computed<number>(() => this.limit() * this.index());

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.dependencyService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe((data) => {
        this.datasource.set(data.dependencies);
        this.datasize.set(data.length);
      });
  }

  create() {
    const dialogRef = this.dialog.open(DependencyDialogComponent, {
      width: '800px',
      maxWidth:'800px'
    });
    dialogRef.afterClosed().subscribe((result: dependency) => {
      if (!result) return;
      this.datasource.update((values) => [result, ...values]);
      this.datasize.update((value) => (value += 1));
    });
  }

  edit(data: dependency) {
    const dialogRef = this.dialog.open(DependencyDialogComponent, {
      width: '900px',
      data,
    });
    dialogRef.afterClosed().subscribe((dependency: dependency) => {
      if (!dependency) return;
      this.datasource.update((values) => {
        const index = values.findIndex((inst) => inst._id === dependency._id);
        values[index] = dependency;
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
