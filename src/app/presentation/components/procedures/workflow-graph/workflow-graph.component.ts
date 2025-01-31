import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  computed,
  input,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
// import * as shape from 'd3-shape';
import { StatusMail, Workflow } from '../../../../domain/models';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { PaginatorComponent } from '../../paginator/paginator.component';
@Component({
    selector: 'workflow-graph',
    imports: [
        CommonModule,
        MatCardModule,
        MatTooltipModule,
        OverlayModule,
    ],
    templateUrl: './workflow-graph.component.html',
    styleUrl: './workflow-graph.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowGraphComponent {
  workflow = input.required<Workflow[]>();
  // @Input() data: Workflow[] = [];
  // public nodes: Node[] = [];
  // public links: Edge[] = [];
  // public curve = shape.curveLinear;
  public clusters: any[] = [];
  public minimapPosition: any = "MiniMapPosition.UpperRight";
  @ViewChild('myTemplate') myTemplateRef!: TemplateRef<any>;
  @ViewChild('mybtn') btn!: ElementRef<any>;
  private overlayRef?: OverlayRef;

  // public graph = computed<{ nodes: Node[]; links: any }>(() => {
  //   return this.createChar(this.workflow());
  // });

  constructor(
    private overlay: Overlay,
    private _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    const listUsers: Record<string, Node> = {};
  }

  addNode(user: any): void {
    // const foundUser = this.nodes.some((node) => node.id === user.cuenta);
    // if (foundUser) return;
    // this.nodes.push({
    //   id: user.cuenta,
    //   label: `funcionario-${user.cuenta}`,
    //   data: {
    //     // dependencia: participant.cuenta.dependencia.nombre,
    //     // institucion: participant.cuenta.dependencia.institucion.nombre,
    //     officer: user.fullname,
    //     jobtitle: user.jobtitle ?? 'Sin cargo',
    //   },
    // });
  }
  // addClusterIfNotFount(participant: any): void {
  //   const indexFoundInstitution = this.clusters.findIndex(
  //     (cluster) => cluster.id === participant.cuenta.dependencia.institucion._id
  //   );
  //   if (indexFoundInstitution === -1) {
  //     this.clusters.push({
  //       id: participant.cuenta.dependencia.institucion._id,
  //       label: `Institucion: ${participant.cuenta.dependencia.institucion.sigla}`,
  //       childNodeIds: [participant.cuenta._id],
  //     });
  //   } else {
  //     this.clusters[indexFoundInstitution].childNodeIds?.push(
  //       participant.cuenta._id
  //     );
  //   }
  // }
  ope(element: HTMLElement) {
    if (this.overlayRef) this.overlayRef.dispose();
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(element)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
          },
        ]),
    });
    const portal = new TemplatePortal(
      this.myTemplateRef,
      this._viewContainerRef
    );
    this.overlayRef.attach(portal);
    this.overlayRef.detachBackdrop();
    this.overlayRef.outsidePointerEvents().subscribe(() => {
      this.overlayRef?.dispose();
    });
  }

  createChar(workflow: Workflow[]) {
    // const nodes: Record<string, Node> = {};
    // const links: any[] = [];
    // workflow.forEach(({ emitter, dispatches }, index) => {
    //   nodes[emitter.cuenta] = {
    //     id: emitter.cuenta,
    //     label: emitter.cuenta,
    //     data: {
    //       fullname: emitter.fullname,
    //       jobtitle: emitter.jobtitle,
    //     },
    //   };
    //   dispatches.forEach(({ receiver, status }, subindex) => {
    //     nodes[receiver.cuenta] = {
    //       id: receiver.cuenta,
    //       label: 'ds',
    //       data: {
    //         fullname: receiver.fullname,
    //         jobtitle: receiver.jobtitle,
    //       },
    //     };
    //     const [label, classEdge, classLink] =
    //       status === StatusMail.Rejected
    //         ? ['Rechazado', 'circle-reject', 'line-reject']
    //         : status === StatusMail.Pending
    //         ? ['Pendiente', 'circle-pending', 'line-pending']
    //         : ['Recibido', 'circle-success', 'line-success'];
    //     links.push({
    //       id: `a${subindex}-${index}`,
    //       source: emitter.cuenta,
    //       target: receiver.cuenta,
    //       label: `${index + 1}`,
    //       data: {
    //         status,
    //         classEdge,
    //         classLink,
    //       },
    //     });
    //   });
    // });
    // return { nodes: [...Object.values(nodes)], links: [...links] };
  }
}
