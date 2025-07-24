import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { Account } from '../../../../administration/domain';
import { CommunicationReportService } from '../../services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-account-tray-state-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Resumen trámites en bandeja</h2>

    <mat-dialog-content>
      @if(isLoading()){
      <div class="py-4 flex justify-center w-full">
        <mat-spinner />
      </div>
      } 
      @else {
      <div class="mb-6 px-2 space-y-1">
        <p><strong class="mr-2">Funcionario:</strong>{{data.fullnameManager }}</p>
        <p><strong class="mr-2">Cargo:</strong>{{data.jobtitle }}</p>
      </div>
      <div class="flex flex-col gap-2 md:flex-row">
        <div class="flex-1 border border-gray-200 rounded-xl p-4 shadow-sm">
          <div class="mb-2">
            <h3 class="text-xl">Bandeja de entrada</h3>
            <p class="text-lg">Total: {{ trayStatus()?.inbox?.total }}</p>
          </div>
          @for (item of trayStatus()?.inbox?.items; track $index) {
          <div class="space-y-2 mt-4">
            <div class="flex justify-between ">
              <span>{{ item.status }}:</span>
              <span class="font-semibold">{{ item.count }}</span>
            </div>
          </div>
          }
        </div>
        <div class="flex-1 border border-gray-200 rounded-xl p-4 shadow-sm">
          <div class="mb-2">
            <h3 class="text-xl">Bandeja de salida</h3>
            <p class="text-lg">Total: {{ trayStatus()?.outbox?.total }}</p>
          </div>
          @for (item of trayStatus()?.outbox?.items; track $index) {
          <div class="space-y-2 mt-4">
            <div class="flex justify-between">
              <span>{{ item.status }}:</span>
              <span class="font-semibold">{{ item.count }}</span>
            </div>
          </div>
          }
        </div>
      </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="mt-6">
      <button matButton cdkFocusInitial mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountTrayStateDialogComponent {
  private reportService = inject(CommunicationReportService);

  data: Account = inject(MAT_DIALOG_DATA);
  isLoading = signal(true);

  trayStatus = toSignal(
    this.reportService
      .getAccountTrayStatus(this.data.id)
      .pipe(finalize(() => this.isLoading.set(false)))
  );
}
