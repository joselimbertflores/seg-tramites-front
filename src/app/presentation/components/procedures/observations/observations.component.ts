import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// import { observationResponse } from '../../../../infraestructure/interfaces';
import { MaterialModule } from '../../../../material.module';
// import {
//   ExternalProcedure,
//   Procedure,
//   StateProcedure,
// } from '../../../../domain/models';
// import { AuthService, ProcedureService } from '../../../services';

@Component({
    selector: 'observations',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
    templateUrl: './observations.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationsComponent {
  // private readonly procedureService = inject(ProcedureService);
  // private readonly authService = inject(AuthService);

  enableOptions = input(false);
  // procedure = model<ExternalProcedure | null>();
  // observations = model.required<observationResponse[]>();

  public isFocused: boolean = false;
  public descripcion = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  ngOnInit(): void {}

  add() {
    // this.procedureService
    //   .addObservation(this.procedure()?._id!, this.descripcion.value)
    //   .subscribe((obs) => {
    //     this.observations.update((values) => [obs, ...values]);
    //     this.procedure.set(
    //       this.procedure()?.copyWith({ state: StateProcedure.Observado })
    //     );
    //     this.removeFocus();
    //   });
  }

  removeFocus() {
    this.isFocused = false;
    this.descripcion.reset();
  }

  solve(id: string) {
    // this.procedureService.solveObservation(id).subscribe((resp) => {
    //   this.observations.update((values) => {
    //     const index = values.findIndex((el) => el._id === id);
    //     values[index].isSolved = true;
    //     return [...values];
    //   });
    //   this.procedure.set(this.procedure()?.copyWith({ state: resp.state }));
    // });
  }

  get manager() {
    return ''
  }
}
