import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'procurement-communication',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './procurement-communication.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcurementCommunicationComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  procedure = input.required<any>();

  formProcedure: FormGroup = this.formBuilder.group({
    numberOfDocuments: ['', Validators.required],
    reference: ['', Validators.required],
    tipo: [''],
    apertura: [''],
    precio: [''],
    codigoProyecto: [''],
    plazo: [''],
    cuce: [''],
    modalidad: [''],
    precioAdjudicado: [''],
    tipoResolucion: [''],
    empreseAdjudicada: [''],
  });
  ngOnInit(): void {
    console.log(this.procedure().numberOfDocuments);
    this.formProcedure.patchValue(this.procedure());
  }
}
