import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  AlertService,
  BackButtonDirective,
  SearchInputComponent,
} from '../../../../shared';
import { ArchiveService } from '../../services';
import { Archive } from '../../../domain';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-archives',
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatPaginatorModule,
    BackButtonDirective,
    SearchInputComponent,
  ],
  templateUrl: './archives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
  styles: `
      tr.detail-row {
        height: 0;
      }
      .element-row td {
        border-bottom-width: 0;
      }
    `,
})
export default class ArchivesComponent implements OnInit {
  private archiveService = inject(ArchiveService);
  private alertService = inject(AlertService);

  readonly displayedColumns: string[] = [
    'document',
    'code',
    'description',
    'officer',
    'date',
    'expand',
    'options',
  ];

  datasource = signal<Archive[]>([]);
  datasize = signal<number>(0);
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');
  isOpen = false;
  folderName = signal<string>('');
  expandedElement: Archive | null;
  selection = new SelectionModel<Archive>(true, []);

  @Input('id') folderId: string;

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    const id = this.folderId === 'no-folder' ? null : this.folderId;
    this.archiveService
      .findAll({
        folderId: id,
        term: this.term(),
        limit: this.limit(),
        offset: this.offset(),
      })
      .subscribe((data) => {
        this.datasource.set(data.archives);
        this.folderName.set(data.folderName);
      });
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  search(term: string) {
    this.term.set(term);
    this.index.set(0);
    this.getData();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.datasource().length;
    return numSelected === numRows;
  }

  unarchive(item: Archive) {
    this.alertService
      .confirmDialog({
        title: `¿Desarchivar tramite?`,
        description: `El tramite volvera a su bandeja de entrada para su remision`,
      })
      .pipe(
        filter((result) => result),
        switchMap(() => this.archiveService.unarchive([item.id]))
      )
      .subscribe(() => {
        this.removeItems([item.id]);
      });
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.datasource().map((el) => el));
  }
  private removeItems(ids: string[]) {
    this.datasource.update((values) =>
      values.filter(({ id }) => !ids.includes(id))
    );
    this.datasize.update((value) => (value -= 1));
  }
}
