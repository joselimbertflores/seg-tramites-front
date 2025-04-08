import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import {
  state,
  style,
  animate,
  transition,
  trigger,
} from '@angular/animations';
import { filter, switchMap } from 'rxjs';

import {
  AlertService,
  BadgeComponent,
  SearchInputComponent,
} from '../../../../shared';

import {
  submissionData,
  submissionResult,
  SubmissionDialogComponent,
} from '../inbox/submission-dialog/submission-dialog.component';
import {
  Communication,
  communcationStatus,
} from '../../../domain/models/communication.model';
import { HumanizeDurationPipe } from '../../pipes/humanize-duration.pipe';
import { OutboxService } from '../../services';

@Component({
  selector: 'outbox',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatPaginatorModule,
    HumanizeDurationPipe,
    SearchInputComponent,
    BadgeComponent,
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
  private dialogRef = inject(MatDialog);
  private alertService = inject(AlertService);
  private outboxService = inject(OutboxService);
  // private pdfService = inject(PdfService);

  datasource = signal<Communication[]>([]);
  datasize = signal<number>(0);
  selection = new SelectionModel<Communication>(true, []);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  term = signal<string>('');
  expandedElement: Communication | null;

  readonly displayedColumns = [
    'select',
    'type',
    'code',
    'reference',
    'recipient',
    'time',
    'expand',
    'options',
  ];

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.outboxService
      .findAll({
        limit: this.limit(),
        offset: this.offset(),
        term: this.term(),
      })
      .subscribe(({ communications, length }) => {
        this.datasource.set(communications.map((item) => item));
        this.datasize.set(length);
        this.selection.clear();
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

  send(item: Communication): void {
    const data: submissionData = {
      mode: 'resend',
      communicationId: item.id,
      isOriginal: item.isOriginal,
      attachmentsCount: item.attachmentsCount,
      procedure: { id: item.procedure.ref, code: item.procedure.code },
      isResend: item.status === 'pending' && item.isOriginal,
    };
    const dialogRef = this.dialogRef.open<
      SubmissionDialogComponent,
      submissionData,
      submissionResult
    >(SubmissionDialogComponent, {
      maxWidth: '1100px',
      width: '1100px',
      data,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.handleSubmisionDialogResult(result, item);
    });
  }

  cancelSelection(): void {
    this.cancel(this.selection.selected);
  }

  cancelOne(communication: Communication): void {
    this.cancel([communication]);
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
    this.selection.select(...this.datasource().map((el) => el));
  }

  isButtonEnabledForStatus(status: string): boolean {
    return (
      this.selection.selected.every((el) => el.status === status) &&
      this.selection.selected.length > 0
    );
  }

  private cancel(items: Communication[]): void {
    this.alertService
      .confirmDialog(
        items.length === 1
          ? {
              title: '¿Cancelar envio?',
              description: `Se cancelara el envio del tramite ${items[0].procedure.code}`,
            }
          : {
              title: '¿Cancelar envios seleccionados?',
              description: `Solo se pueden cancelar los envios que aun no hayan sido recibidos`,
            }
      )
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.outboxService.cancel(items.map(({ id }) => id)))
      )
      .subscribe(({ ids }) => {
        this.datasource.update((values) =>
          values.filter(({ id }) => !ids.includes(id))
        );
        this.datasize.update((value) => (value -= ids.length));
        this.selection.clear();
        if (this.datasource().length === 0 && this.datasize() > 0) {
          this.index.set(0);
          this.getData();
        }
      });
  }

  private handleSubmisionDialogResult(
    result: submissionResult,
    currentItem: Communication
  ): void {
    if (result.error) {
      this.datasource.update((values) => {
        const index = values.findIndex(({ id }) => id === currentItem.id);
        values[index].status = communcationStatus.AutoRejected;
        return [...values];
      });
      return;
    }
    const newItems = result.data ?? [];

    if (currentItem.status === communcationStatus.Pending) {
      this.datasize.update((value) => (value += newItems.length));
      this.datasource.update((values) =>
        [...newItems, ...values].splice(0, this.limit())
      );
    } else {
      this.datasize.update((value) => (value += newItems.length - 1));
      this.datasource.update((values) =>
        [
          ...newItems,
          ...values.filter(({ id }) => id !== currentItem.id),
        ].slice(0, this.limit())
      );
    }
  }
}
