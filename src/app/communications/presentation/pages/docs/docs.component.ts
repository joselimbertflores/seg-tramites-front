import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';

import { DocDialogComponent } from './doc-dialog/doc-dialog.component';
import {
  SearchInputComponent,
  WordGeneratorService,
  YearPickerComponent,
} from '../../../../shared';
import { Doc, DOCUMENT_TYPES } from '../../../domain';
import { doc } from '../../../infrastructure';
import { DocService } from '../../services';

@Component({
  selector: 'app-docs',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatToolbarModule,
    OverlayModule,
    MatSelectModule,
    SearchInputComponent,
    YearPickerComponent,
  ],
  templateUrl: './docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocsComponent implements OnInit {
  private dialogRef = inject(MatDialog);
  private docService = inject(DocService);
  private wordGeneratorService = inject(WordGeneratorService);
  displayedColumns: string[] = [
    'cite',
    'reference',
    'sender',
    'procedure',
    'date',
    'options',
  ];

  datasource = signal<Doc[]>([]);
  datasize = signal<number>(0);
  readonly documentTypes = [{ value: null, label: 'TODOS' }, ...DOCUMENT_TYPES];

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');
  isOpen = false;

  isFilterOpen = false;
  filterForm: FormGroup = inject(FormBuilder).group({
    year: [],
    type: [],
  });

  ngOnInit(): void {
    this.getData();
  }

  create() {
    const dialogRef = this.dialogRef.open(DocDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      // if (!result) return;
      // this.datasize.update((value) => (value += 1));
      // this.datasource.update((values) => {
      //   if (values.length === this.limit()) values.pop();
      //   return [result, ...values];
      // });
      // this.send(result);
    });
  }

  update(element: doc) {
    const dialogRef = this.dialogRef.open(DocDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
      data: element,
    });
  }

  getData() {
    this.docService.findAll().subscribe(({ documents, length }) => {
      this.datasource.set(documents);
    });
  }

  generateTemplate(item: doc) {
    this.wordGeneratorService.generateDocument(item);
  }

  search(term: string) {
    this.term.set(term);
    this.index.set(0);
    this.getData();
  }

  filter() {
    this.index.set(0);
    this.isOpen = false;
    this.getData();
  }

  reset() {
    this.filterForm.reset();
    this.isOpen = false;
    this.getData();
  }
}
