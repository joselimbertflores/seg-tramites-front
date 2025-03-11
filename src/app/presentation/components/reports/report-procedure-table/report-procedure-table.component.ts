import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
// import { TableProcedureData } from '../../../../infraestructure/interfaces';
import { StateLabelPipe } from '../../../pipes';

export interface ProcedureTableColumns {
  columnDef: string;
  header: string;
}

@Component({
    selector: 'report-procedure-table',
    imports: [
        CommonModule,
        MatTableModule,
        RouterModule,
        MatTableModule,
        StateLabelPipe,
    ],
    templateUrl: './report-procedure-table.component.html',
    styles: `
  .mat-mdc-cell {
  font-size: 12px;
}`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportProcedureTableComponent {
  public displayedColumns: string[] = [];
  public columns: ProcedureTableColumns[] = [];
  @Input({ required: true }) pageIndex!: number;
  @Input({ required: true }) pageSize!: number;
  // @Input() datasource = signal<TableProcedureData[]>([]);
  @Input() set colums(values: ProcedureTableColumns[]) {
    this.columns = values;
    this.displayedColumns = values.map(({ columnDef }) => columnDef);
  }
  constructor() {}
}
