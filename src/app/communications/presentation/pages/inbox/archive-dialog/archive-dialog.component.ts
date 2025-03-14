import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

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
    <h2 mat-dialog-title>
      Archivado de {{ data.length > 1 ? 'tramites' : 'tramite' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="archiveForm">
        <div class="flex flex-col">
          <div class="text-md mb-6">
            @if(data.length>1){ Se archivaran un total de
            {{ data.length }} tramites. } @else { El tramite
            {{ data[0].procedure.code }} sera archivado. }
          </div>
          <select-search
            [items]="folders()"
            title="Carpeta (Opcional)"
            placeholder="Seleccione una carpeta"
            placeholderLabel="Nombre de la carpeta a buscar"
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
          <mat-radio-group
            formControlName="state"
            class="flex flex-col p-2"
            required
          >
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
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
  private folderService = inject(FolderService);
  private archiveService = inject(ArchiveService);
  private alertService = inject(AlertService);

  data: Communication[] = inject(MAT_DIALOG_DATA);
  folders = toSignal(this.getFolders(), { initialValue: [] });

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

  archiveForm: FormGroup = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(4)]],
    state: ['', Validators.required],
    folderId: [null],
  });

  constructor() {}

  archive() {
    const selection = this.data.map(({ id }) => id);
    this.alertService
      .confirmDialog({
        title: `¿Confirmar archivado?`,
        description:
          this.data.length === 1
            ? `El tramite ${this.data[0].procedure.code} pasara a su seccion de archivos`
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
        this.dialogRef.close(selection);
      });
  }

  private getFolders(): Observable<selectOption<string>[]> {
    return this.folderService
      .getFolders()
      .pipe(
        map((resp) =>
          resp.map(({ _id, name }) => ({ value: _id, label: name }))
        )
      );
  }
}
