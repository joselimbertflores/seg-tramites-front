import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DocxService, SearchInputComponent } from '../../../../shared';
import { ProcurementService } from '../../services';
import {
  InternalProcedure,
  procedureState,
  procurementDoc,
  ProcurementProcedure,
} from '../../../domain';
import { InternalDialogComponent } from '../internals-manage/internal-dialog/internal-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { ProcurementDialogComponent } from './procurement-dialog/procurement-dialog.component';
import { submissionData } from '../../../../communications/domain';
import { SubmissionDialogComponent } from '../../../../communications/presentation/pages/inbox/submission-dialog/submission-dialog.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DocProcurementDialogComponent } from './doc-procurement-dialog/doc-procurement-dialog.component';
import { PdfService } from '../../../../presentation/services';

@Component({
  selector: 'app-procurements-manage',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatMenuModule,
    SearchInputComponent,
  ],
  templateUrl: './procurements-manage.component.html',
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
    tr.example-detail-row {
      height: 0;
    }
    .example-element-row td {
      border-bottom-width: 0;
    }
  `,
})
export default class ProcurementsManageComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  private docxService = inject(DocxService);
  private pdfService = inject(PdfService);

  datasource = signal<ProcurementProcedure[]>([]);
  datasize = signal<number>(0);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'send',
    'code',
    'reference',
    'mode',
    'createdAt',
    'expand',
    'options',
  ];
  expandedElement: any | null;

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.procurementService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe((data) => {
        this.datasource.set(data.procedures);
        this.datasize.set(data.length);
      });
  }

  create() {
    const dialogRef = this.dialog.open(ProcurementDialogComponent, {
      maxWidth: '1200px',
      width: '1200px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((procedure) => {
      if (!procedure) return;
      this.datasource.update((values) => {
        if (values.length === this.limit()) values.pop();
        return [procedure, ...values];
      });
      this.datasize.update((value) => (value += 1));
      console.log(procedure);
    });
  }

  update(procedure: InternalProcedure) {
    const dialogRef = this.dialog.open(ProcurementDialogComponent, {
      maxWidth: '1200px',
      width: '1200px',
      data: procedure,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procedure._id);
        values[index] = result;
        return [...values];
      });
    });
  }

  send(procedure: any) {
    const data: submissionData = {
      procedure: {
        id: procedure._id,
        code: procedure.code,
      },
      attachmentsCount: procedure.numberOfDocuments,
      cite: procedure.cite,
      isOriginal: true,
      mode: "initiate",
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '1100px',
      width: '1100px',
      data,
    });
    dialogRef.afterClosed().subscribe((message) => {
      if (!message) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procedure._id);
        values[index].state = procedureState.Revision;
        return [...values];
      });
    });
  }

  updateDocument(
    procurementId: string,
    document: procurementDoc,
    docIndex: number
  ) {
    const dialogRef = this.dialog.open(DocProcurementDialogComponent, {
      maxWidth: '800px',
      width: '800px',
      data: { procurementId: procurementId, index: docIndex, document },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procurementId);
        values[index].documents[docIndex] = result;
        return [...values];
      });
    });
  }

  async generateDocument(item: ProcurementProcedure, index: number) {
    switch (index) {
      case 0:
        await this.docxService.solicitudCertificacionPoa(item, index);
        break;
      case 1:
        await this.docxService.solicitudCertificacionPresupuestaria(
          item,
          index
        );
        break;
      case 2:
        await this.docxService.solicitudIniciContratacion(item, index);
        break;
      default:
        break;
    }
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
