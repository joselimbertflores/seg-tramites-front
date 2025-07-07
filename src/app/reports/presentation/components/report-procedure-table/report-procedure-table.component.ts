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
  tableProcedureData,
  tableProcedureColums,
} from '../../../infrastructure';
import { procedureGroup } from '../../../../procedures/domain';

@Component({
  selector: 'report-procedure-table',
  imports: [CommonModule, MatTableModule, RouterModule],
  template: `
    <table mat-table [dataSource]="data()">
      @for (item of columns(); track $index) {
      <ng-container matColumnDef="{{ item.columnDef }}">
        <th mat-header-cell *matHeaderCellDef>{{ item.header }}</th>
          @switch (item.columnDef) { 
            @case ("group") {
              <td  mat-cell  *matCellDef="let element" class="sm:w-28">
                @switch (element.group) {
                  @case (group.External) {
                    Externo
                  }
                  @case (group.Internal) {
                    Interno
                  }
                  @default {
                    Contratacion
                  }
                }
              </td>
            }
            @case ("code") {
              <td mat-cell *matCellDef="let element" class="sm:w-52">
                <a
                  [routerLink]="['/home/reports', element.group, element.id]"
                  class="text-blue-500"
                >
                  {{ element['code'] }}
                </a>
              </td>
            } 
            @case ("reference") {
              <td  mat-cell  *matCellDef="let element" class="sm:max-w-96">
                <p class="truncate">{{ element['reference'] }}</p>
              </td>
            } 
            @case ("createdAt") {
              <td mat-cell *matCellDef="let element" class="sm:w-32">
                {{ element['createdAt'] | date : 'short' : '-400' }}
              </td>
            } 
            @default {
              <td mat-cell *matCellDef="let element">
                {{ element[item.columnDef] }}
              </td>
            } 
          }
      </ng-container>
      }
      <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell p-3" [attr.colspan]="displayedColumns().length">SIN RESULTADOS.</td>
      </tr>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportProcedureTableComponent {
  data = input.required<tableProcedureData[]>();
  columns = input.required<tableProcedureColums[]>();

  displayedColumns = computed(() =>
    this.columns().map(({ columnDef }) => columnDef)
  );

  get group(){
    return procedureGroup
  }
}
