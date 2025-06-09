import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

import { filter, switchMap } from 'rxjs';

import { PublicationDialogComponent } from './publication-dialog/publication-dialog.component';
import { publication } from '../../../infrastructure/interfaces/publications.interface';
import { PublicationService } from '../../services/publication.service';
import { AlertService, SearchInputComponent } from '../../../../shared';

@Component({
  selector: 'app-publications-manage',
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    SearchInputComponent,
  ],
  templateUrl: './publications-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PublicationsManageComponent implements OnInit {
  private publicationService = inject(PublicationService);
  private alertService = inject(AlertService);
  readonly dialogRef = inject(MatDialog);

  datasource = signal<publication[]>([]);
  datasize = signal<number>(0);

  readonly displayedColumns: string[] = [
    'title',
    'attachment',
    'priority',
    'from',
    'to',
    'createdAt',
    'options',
  ];

  term = signal<string>('');
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.publicationService
      .findByUser(this.term())
      .subscribe(({ publications, length }) => {
        this.datasource.set(publications);
        this.datasize.set(length);
      });
  }

  create(): void {
    const dialogRef = this.dialogRef.open(PublicationDialogComponent, {
      minWidth: '800px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) =>
        [result, ...values].slice(0, this.limit())
      );
    });
  }

  update(publication: publication): void {
    const dialogRef = this.dialogRef.open(PublicationDialogComponent, {
      minWidth: '800px',
      data: publication,
    });
    dialogRef.afterClosed().subscribe((result: publication) => {
      this.datasource.update((values) => {
        const index = values.findIndex((el) => el._id === result._id);
        if (index === -1) return values;
        values[index] = result;
        return [...values];
      });
    });
  }

  remove(publication: publication) {
    this.alertService
      .confirmDialog({
        title: `¿Eliminar Publicacion?`,
        description: 'La publicacion dejara de mostrarse en esta seccion como en la de comunicados',
      })
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.publicationService.delete(publication._id))
      )
      .subscribe(() => {
        this.datasource.update((values) =>
          values.filter(({ _id }) => _id !== publication._id)
        );
        this.datasize.update((value) => (value -= 1));
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
