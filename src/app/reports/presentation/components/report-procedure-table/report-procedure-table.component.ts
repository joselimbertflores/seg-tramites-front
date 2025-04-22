import {
  input,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  tableProcedureColums,
  tableProcedureData,
} from '../../../infrastructure';

export interface ProcedureTableColumns {
  columnDef: string;
  header: string;
}

@Component({
  selector: 'report-procedure-table',
  imports: [CommonModule, MatTableModule, RouterModule],
  template: `
    @if(datasource().length>0){
    <table mat-table [dataSource]="datasource()">
      @for (item of columns(); track $index) {
      <ng-container matColumnDef="{{ item.columnDef }}">
        <th mat-header-cell *matHeaderCellDef>{{ item.header }}</th>
        @switch (item.columnDef) { @case ("code") {
        <td
          mat-cell
          *matCellDef="let element"
          [id]="element._id"
          class="w-[200px]"
        >
          <a
            [routerLink]="['/home/reports', element.group, element._id]"
            class="text-blue-500"
          >
            {{ element['code'] }}
          </a>
        </td>
        } @case ("reference") {
        <td
          mat-cell
          *matCellDef="let element"
          [id]="element._id"
          class="sm:max-w-72"
        >
          <p class="truncate">{{ element['reference'] }}</p>
        </td>
        } @case ("startDate") {
        <td
          mat-cell
          *matCellDef="let element"
          [id]="element._id"
          class="w-[150px]"
        >
          {{ element['startDate'] | date : 'short' : '-400' }}
        </td>
        } @default {
        <td mat-cell *matCellDef="let element" [id]="element._id">
          {{ element[item.columnDef] }}
        </td>
        } }
      </ng-container>
      }
      <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell p-3" colspan="5">No se encontraron resultados</td>
      </tr>
    </table>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportProcedureTableComponent {
  datasource = input.required<tableProcedureData[]>();
  columns = input.required<tableProcedureColums[]>();

  displayedColumns = computed(() =>
    this.columns().map(({ columnDef }) => columnDef)
  );
}
