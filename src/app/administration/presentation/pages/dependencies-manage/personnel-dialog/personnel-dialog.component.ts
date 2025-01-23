import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { dependency } from '../../../../infrastructure';
import { DependencyService } from '../../../services';
import { Officer } from '../../../../domain';

interface personnel {
  accountId: string;
  officer?: Officer;
  jobtitle: string;
  area: number | null;
}
@Component({
  selector: 'app-personnel-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Personal de unidad</h2>
    <mat-dialog-content>
      <div class="mb-4">{{ data.nombre }}</div>
      <div
        class="flex flex-col gap-x-2 gap-y-3 overflow-y-scroll max-h-80 py-2 px-4 border-2 rounded-lg"
      >
        @for (item of personnel(); track $index) {
        <div class="flex items-center">
          <div class="w-1/2">
            <div class="block font-medium">
              {{ item.officer?.fullname | titlecase }}
            </div>
            <div>
              {{ item.jobtitle }}
            </div>
          </div>
          <div class="w-1/2 h-[54px]">
            <mat-form-field appearance="outline">
              <mat-label>Area</mat-label>
              <mat-select [(ngModel)]="item.area">
                <mat-option [value]="null"> NINGUNA </mat-option>
                @for (area of data.areas; track $index) {
                <mat-option [value]="area.code">
                  {{ area.name }}
                </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>
        } @empty {
        <p>Sin personal</p>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-button (click)="save()">Aceptar</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonnelDialogComponent implements OnInit {
  private dependencyService = inject(DependencyService);
  private dialogRef = inject(MatDialogRef);

  data: dependency = inject(MAT_DIALOG_DATA);
  personnel = signal<personnel[]>([]);

  ngOnInit(): void {
    this._getAccountsInDependency();
  }

  save() {
    const data = this.personnel().map(({ accountId, area }) => ({
      accountId,
      area,
    }));
    this.dependencyService
      .assignDependencyAreas(data)
      .subscribe(() => this.dialogRef.close());
  }

  private _getAccountsInDependency() {
    this.dependencyService
      .getAccountsInDependency(this.data._id)
      .subscribe((data) => this.personnel.set(data));
  }
}
