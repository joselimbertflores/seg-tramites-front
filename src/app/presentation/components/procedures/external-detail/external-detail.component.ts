import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import {
  LocationComponent,
  ObservationsComponent,
  WorkflowListComponent,
  WorkflowGraphComponent,
} from '../../index';
import {
  ExternalProcedure,
  GroupProcedure,
  StateProcedure,
  Workflow,
} from '../../../../domain/models';
import { AuthService, PdfService, ProcedureService } from '../../../services';
import {
  locationResponse,
  observationResponse,
} from '../../../../infraestructure/interfaces';

@Component({
    selector: 'external-detail',
    imports: [
        CommonModule,
        MaterialModule,
        LocationComponent,
        ObservationsComponent,
        WorkflowGraphComponent,
        WorkflowListComponent,
    ],
    templateUrl: './external-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalDetailComponent implements OnInit {
  private authService = inject(AuthService);
  private procedureService = inject(ProcedureService);
  private pdfService = inject(PdfService);

  readonly id = input.required<string>();
  readonly enableOptions = input<boolean>(false);
  onStateChange = output<StateProcedure>();

  procedure = signal<ExternalProcedure | null>(null);
  workflow = signal<Workflow[]>([]);
  location = signal<locationResponse[]>([]);
  observations = signal<observationResponse[]>([]);
  manager = computed(() => {
    if (!this.enableOptions()) return undefined;
    // return this.authService.account()?.id_account;
  });

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    forkJoin([
      this.procedureService.getDetail(this.id(), GroupProcedure.External),
      this.procedureService.getLocation(this.id()),
      this.procedureService.getWorkflow(this.id()),
      this.procedureService.getObservations(this.id()),
    ]).subscribe((resp) => {
      this.procedure.set(resp[0] as ExternalProcedure);
      this.location.set(resp[1]);
      this.workflow.set(resp[2]);
      this.observations.set(resp[3]);
    });
  }

  changeStateProcedure(state: StateProcedure) {
    this.procedure.set(this.data.copyWith({ state }));
    this.onStateChange.emit(state);
  }

  get data() {
    return this.procedure()!;
  }

  print() {
    this.pdfService.GenerateIndexCard(this.procedure()!, this.workflow());
  }
}
