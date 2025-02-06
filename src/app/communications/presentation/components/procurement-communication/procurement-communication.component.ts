import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { ProcurementProcedure } from '../../../../procedures/domain';
import { ProcurementService } from '../../../../procedures/presentation/services';
import { AlertMessageComponent } from '../../../../shared';
@Component({
  selector: 'procurement-communication',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    MatExpansionModule,
    AlertMessageComponent,
  ],
  templateUrl: './procurement-communication.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  
})
export class ProcurementCommunicationComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  procedure = model.required<ProcurementProcedure>();
  isReveived = input<boolean>(false);

  formProcedure: FormGroup = inject(FormBuilder).group({
    cuce: [''],
    precioAdjudicado: [''],
    fechaApertura: [''],
    tipoResolucion: [''],
    empreseAdjudicada: [''],
    representanteLegal: [''],
    codigoProyecto: [''],
  });

  isAlertShowing = signal(false);

  constructor() {
    effect(() => {
      this.formProcedure.patchValue(this.procedure());
    });
  }

  ngOnInit(): void {
    this.formProcedure.patchValue(this.procedure());
  }

  save() {
    this.procurementService
      .update(this.procedure()._id, this.formProcedure.value)
      .subscribe((procedure) => {
        this.procedure.set(procedure);
        this.isAlertShowing.set(true);
      });
  }
}
