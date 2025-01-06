import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
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
          <div class="mb-4 text-lg">
            {{ procedureLabel() }}
          </div>
          <select-search
            [items]="folders()"
            title="Carpeta"
            placeholder="Seleccione una carpeta"
            placeholderLabel="Nombre"
            (onSelect)="archiveForm.get('folderId')?.setValue($event)"
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
          <mat-radio-group formControlName="state" class="flex flex-col p-2">
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
      <button
        mat-button
        color="primary"
        [disabled]="archiveForm.invalid"
        (click)="archive()"
      >
        Archivar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchiveDialogComponent {
  private _formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
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
      ? `Tramite a archivar: ${this.data[0].procedure.code}}`
      : `Total tramites a archivar: ${this.data.length}`
  );

  archiveForm: FormGroup = this._formBuilder.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(4)]],
    folderId: ['', Validators.required],
    state: ['', Validators.required],
  });

  constructor() {}

  archive() {
    const selection = this.data.map(({ id }) => id);
    this.alertService
      .confirmDialog({
        title: `¿Confirmar archivado?`,
        description:
          this.data.length === 1
            ? `Se archivara el tramite ${this.data[0].procedure.code}`
            : `Los tramites seleccionados pasaran a su seccion de archivos`,
      })
      .pipe(
        filter((confirm) => confirm),
        switchMap(() =>
          this.archiveService.create({
            communicationIds: selection,
            ...this.archiveForm.value,
          })
        )
      )
      .subscribe(() => {
        this.dialogRef.close(this.data.map(({ id }) => id));
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
