import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { filter, switchMap } from 'rxjs';

import { CommunicationService } from '../../../../presentation/services';
import { AlertService, SearchInputComponent } from '../../../../shared';
import { SubmissionDialogComponent } from '../inbox/submission-dialog/submission-dialog.component';
import {
  communcationStatus,
  Communication,
} from '../../../domain/models/communication.model';
import { submissionDialogData } from '../../../domain';

@Component({
  selector: 'outbox',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    OverlayModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './outbox.component.html',
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
export default class OutboxComponent {
  private alertService = inject(AlertService);
  private communicationService = inject(CommunicationService);
  // private pdfService = inject(PdfService);

  private dialog = inject(MatDialog);

  datasource = signal<Communication[]>([]);
  datasize = signal<number>(0);
  selection = new SelectionModel<Communication>(true, []);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  term = signal<string>('');
  isOriginal = signal<boolean | null>(null);
  status = signal<
    communcationStatus.Pending | communcationStatus.Rejected | null
  >(null);

  expandedElement: any | null;

  readonly statusOptions = [
    { value: null, label: 'Todos' },
    { value: communcationStatus.Rejected, label: 'Rechazados' },
    { value: communcationStatus.Pending, label: 'Pendientes' },
  ];
  readonly documentOptions = [
    { value: null, label: 'Todos' },
    { value: true, label: 'Original' },
    { value: false, label: 'Copia' },
  ];
  readonly displayedColumns = [
    'select',
    'status',
    'type',
    'code',
    'reference',
    'recipient',
    'sentDate',
    'expand',
    'options',
  ];
  isOpen = false;

  constructor() {}

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.communicationService
      .getOutbox({
        limit: this.limit(),
        offset: this.offset(),
        term: this.term(),
        status: this.status(),
        isOriginal: this.isOriginal(),
      })
      .subscribe(({ communications, length }) => {
        this.datasource.set(communications);
        this.datasize.set(length);
        this.selection.clear();
      });
  }

  send({
    id,
    status,
    procedure,
    isOriginal,
    attachmentsCount,
  }: Communication): void {
    const data: submissionDialogData = {
      communicationId: id,
      procedure: { id: procedure.ref, code: procedure.code },
      isResend: status === communcationStatus.Rejected ? true : false,
      attachmentsCount,
      isOriginal,
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '900px',
      width: '900px',
      data: data,
    });
    dialogRef.afterClosed().subscribe((result: Communication[]) => {
      if (!result) return;
      this.datasource.update((values) => {
        values.unshift(...result);
        if (status === communcationStatus.Rejected) {
          values = values.filter((el) => el.id !== id);
        }
        if (values.length > this.limit()) {
          values.splice(this.limit(), values.length - this.limit());
        }
        return [...values];
      });
      this.datasize.update((value) => {
        value += result.length;
        if (status === communcationStatus.Rejected) {
          value -= 1;
        }
        return value;
      });
      this.selection.clear();
    });
  }

  cancelSelection(): void {
    this._cancel(this.selection.selected.map((el) => el.id));
  }

  cancelOne(communication: Communication): void {
    this._cancel([communication.id], communication.procedure.code);
  }

  generateRouteMap({ procedure }: Communication) {
    // TODO generate router map
    // forkJoin([
    //   this.procedureService.getDetail(procedure._id, procedure.group),
    //   this.procedureService.getWorkflow(procedure._id),
    // ]).subscribe((resp) => {
    //   this.pdfService.generateRouteSheet(resp[0], resp[1]);
    // });
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

  filter() {
    this.index.set(0);
    this.isOpen = false;
    this.getData();
  }

  reset() {
    this.isOpen = false;
    this.status.set(null);
    this.isOriginal.set(null);
    this.term.set('');
    this.getData();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.datasource().length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.datasource());
  }

  private _cancel(communicationIds: string[], code?: string): void {
    this.alertService
      .confirmDialog(
        communicationIds.length === 1
          ? {
              title: '¿Cancelar envio?',
              description: `Se cancelara el envio del tramite ${
                code ?? 'seleccionado'
              }`,
            }
          : {
              title: '¿Cancelar envios seleccionados?',
              description: `Solo se pueden cancelar los envios que aun no hayan sido recibidos`,
            }
      )
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.communicationService.cancel(communicationIds))
      )
      .subscribe(() => {
        this.datasource.update((values) =>
          values.filter(({ id }) => !communicationIds.includes(id))
        );
        this.datasize.update((value) => (value -= communicationIds.length));
        this.selection.clear();
        if (this.datasource().length === 0 && this.datasize() > 0) {
          this.index.set(0);
          this.getData();
        }
      });
  }
}
