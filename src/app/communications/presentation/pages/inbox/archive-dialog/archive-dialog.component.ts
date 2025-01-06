import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Observable, switchMap } from 'rxjs';

import { ArchiveService, FolderService } from '../../../services';
import {
  AlertService,
  selectOption,
  SelectSearchComponent,
} from '../../../../../shared';
import { procedureState } from '../../../../../procedures/domain';
import { Communication } from '../../../../domain';

@Component({
  selector: 'app-archive-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    SelectSearchComponent,
  ],
  template: `
    <h2 mat-dialog-title>Archivado de tramite</h2>
    <mat-dialog-content>
      <form [formGroup]="archiveForm" class="pt-2">
        <div class="flex flex-col">
          <div class="mb-4">
            <!-- {{ procedureLabel() }} -->
          </div>
          <select-search
            [items]="folders()"
            title="Carpeta"
            placeholder="Seleccione una carpeta"
            placeholderLabel="Nombre"
          />
          <mat-form-field appearance="outline">
            <mat-label>Descripcion</mat-label>
            <textarea
              matInput
              formControlName="description"
              placeholder="Ingrese el motivo del archivo"
            ></textarea>
          </mat-form-field>

          <label>Archivar como:</label>
          <mat-radio-group formControlName="status" class="flex flex-col p-2">
            @for (option of statusOptions; track $index) {
            <mat-radio-button [value]="option.value">
              {{ option.label }}
            </mat-radio-button>
            }
          </mat-radio-group>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="warn" mat-dialog-close>Cancelar</button>
      <button mat-button color="primary" [disabled]="archiveForm.invalid">
        Archivar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchiveDialogComponent {
  private _formBuilder = inject(FormBuilder);
  private folderService = inject(FolderService);
  private archiveService = inject(ArchiveService);
  private alertService = inject(AlertService);

  data: Communication[] = inject(MAT_DIALOG_DATA);
  folders = toSignal(this._getFolders(), { initialValue: [] });
  readonly statusOptions = [
    {
      value: procedureState.Concluido,
      label: 'Finalizado: Se concluyo correctamente',
    },
    {
      value: procedureState.Suspendido,
      label: 'Suspendido: Se continuara en un futuro',
    },
    {
      value: procedureState.Anulado,
      label: 'Anulado: Tramite incorrecto',
    },
  ];

  procedureLabel = computed(() =>
    this.data.length === 1
      ? `Tramite: ${this.data[0].procedure.code}}`
      : `Tramites a archivar: ${this.data.length}`
  );

  archiveForm = this._formBuilder.group({
    description: ['', [Validators.required, Validators.maxLength(4)]],
    folderId: ['', Validators.required],
    state: ['', Validators.required],
  });

  constructor() {}

  showConfirmArchi(): void {}

  archive() {
    const selection = this.data.map(({ id, status }) => {
      id;
    });
    this.alertService
      .confirmDialog({
        title: `¿Confirmar Archivado?`,
        description: `Se remitira el tramite ${this.data.procedure.code}`,
      })
      .pipe(
        filter((config) => config),
        switchMap(() => this.archiveService.create(this.archiveForm.value))
      )
      .subscribe((result) => {
        if (!result) return;
      });
  }

  private _getFolders(): Observable<selectOption<string>[]> {
    return this.folderService
      .getFolders()
      .pipe(
        map((resp) =>
          resp.map(({ _id, name }) => ({ value: _id, label: name }))
        )
      );
  }
}
