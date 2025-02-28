import { CommonModule } from '@angular/common';
import {
  input,
  computed,
  Component,
  ChangeDetectionStrategy,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Edge, NgxGraphModule, Node } from '@swimlane/ngx-graph';
import { communication } from '../../../../communications/infrastructure';
import { communcationStatus } from '../../../../communications/domain';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
@Component({
  selector: 'workflow-graph',
  imports: [CommonModule, NgxGraphModule, PortalModule],
  template: `
    <div class="w-full h-[80vh] p-6">
      <div class="graph-container h-full bg-gray-100">
        <ngx-graph
          class="chart-container"
          [links]="graph().links"
          [nodes]="graph().nodes"
          [draggingEnabled]="false"
          [showMiniMap]="true"
          [autoCenter]="true"
          [nodeWidth]="500"
          [nodeHeight]="500"
          layout="dagreCluster"
        >
          <ng-template #defsTemplate>
            <svg:marker
              id="arrow"
              viewBox="0 -5 10 10"
              refX="8"
              refY="0"
              markerWidth="4"
              markerHeight="4"
              orient="auto"
            >
              <svg:path d="M0,-5L10,0L0,5" class="arrow-head" />
            </svg:marker>
          </ng-template>

          <ng-template #clusterTemplate let-cluster>
            <svg:g class="node cluster">
              <svg:rect
                rx="5"
                ry="5"
                [attr.width]="cluster.dimension.width"
                [attr.height]="cluster.dimension.height"
                [attr.fill]="cluster.data.color"
              />
            </svg:g>
          </ng-template>

          <ng-template #nodeTemplate let-node>
            <svg:g class="node" width="500" height="500">
              <svg:foreignObject width="500" height="500">
                <xhtml:div class="cardContainer bg-blue-50">
                  <!-- <div class="rounded-lg p-4  shadow-lg">
                    <img
                      class="mx-auto h-auto rounded-full w-12"
                      src="assets/images/account.png"
                    />
                    <p class="text-center truncate text-md font-bold leading-8">
                      {{ node.data.fullname | titlecase }}
                    </p>
                    <p class="text-sm text-center truncate leading-6">
                      {{ node.data.jobtitle }}
                    </p>
                  </div> -->
                  <!-- <article class="rounded-xl border-2 border-gray-400 ">
                    <div class="flex items-start gap-4 p-4 sm:p-6 lg:p-8">
                      <a href="#" class="block shrink-0">
                        <img
                          alt=""
                          src="images/icons/account.png"
                          class="size-10 rounded-full object-cover"
                        />
                      </a>

                      <div>
                        <h3 class="font-medium sm:text-lg">
                          <a href="#" class="hover:underline">
                            Question about Livewire Rendering-3 and Alpine JS
                          </a>
                        </h3>

                        <p class="line-clamp-2 text-sm text-gray-700">
                          Lorem ipsum dolor, sit amet consectetur adipisicing
                          elit. Accusamus, accusantium temporibus iure delectus
                          ut totam natus nesciunt ex? Ducimus, enim.
                        </p>

                        <div class="mt-2 sm:flex sm:items-center sm:gap-2">
                          <div class="flex items-center gap-1 text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="size-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                              />
                            </svg>

                            <p class="text-xs">14 comments</p>
                          </div>

                          <span class="hidden sm:block" aria-hidden="true"
                            >&middot;</span
                          >

                          <p
                            class="hidden sm:block sm:text-xs sm:text-gray-500"
                          >
                            Posted by
                            <a
                              href="#"
                              class="font-medium underline hover:text-gray-700"
                            >
                              John
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="flex justify-end">
                      <strong
                        class="-me-[2px] -mb-[2px] inline-flex items-center gap-1 rounded-ss-xl rounded-ee-xl bg-green-600 px-3 py-1.5 text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>

                        <span class="text-[10px] font-medium sm:text-xs"
                          >Solved!</span
                        >
                      </strong>
                    </div>
                  </article> -->

                  <div
                    class="w-full max-w-sm border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div class="flex justify-end px-4 pt-4">
                      @if( node.data.icon ){
                      <img
                        class="w-12 mb-3 "
                        src="images/icons/archive.png"
                        alt="Bonnie image"
                      />
                      }
                    </div>
                    <div class="flex flex-col items-center pb-10">
                      <img
                        class="w-12 mb-3 rounded-full"
                        src="images/icons/account.png"
                        alt="Bonnie image"
                      />
                      <h5 class="mb-1 text-xl font-medium text-gray-900 ">
                        Bonnie Green
                      </h5>
                      <span class="text-sm text-gray-500 "
                        >Visual Designer</span
                      >
                    </div>
                    <button (click)="openModal()">Abrir</button>
                  </div>
                </xhtml:div>
              </svg:foreignObject>
            </svg:g>
          </ng-template>

          <ng-template #linkTemplate let-link>
            <svg:g class="edge">
              <svg:path
                class="line"
                stroke-width="3"
                [ngClass]="[link.data.class]"
                marker-end="url(#arrow)"
              ></svg:path>
              <svg:text class="edge-label" text-anchor="middle">
                <textPath
                  class="text-path"
                  [attr.href]="'#' + link.id"
                  [style.dominant-baseline]="link.dominantBaseline"
                  startOffset="50%"
                ></textPath>
              </svg:text>
            </svg:g>
          </ng-template>
        </ngx-graph>
      </div>
    </div>

    <ng-template cdkPortal>
      <div class="overlay w-[200px]">
        <p>Hola</p>
      </div>
    </ng-template>
  `,
  styles: `
    .graph-container {
      border: 1px solid #000;
    }
    .pending {
      stroke: #FF8C42;
    }
    .rejected {
      stroke: #EF233C;
      stroke-dasharray: 4 4;
    }
    .forwarding {
      stroke: #EF233C;
      stroke-dasharray: 4 4;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowGraphComponent {
  workflow = input.required<communication[]>();
  graph = computed(() => this.createGraph(this.workflow()));

  @ViewChild('openButton', { read: ElementRef }) openButton!: ElementRef;

  @ViewChild(CdkPortal) portal!: CdkPortal;

  private overlay = inject(Overlay);

  private overlayRef: OverlayRef;

  private errorStates: string[] = [
    communcationStatus.Rejected,
    communcationStatus.AutoRejected,
  ];

  private createGraph(workflow: communication[]) {
    const nodes: Record<string, Node> = {};
    const links: Edge[] = [];
    workflow.forEach(({ sender, recipient, status, isOriginal }, index) => {
      const icon = isOriginal ? 'images/copy.png' : 'images/copy-black.png';
      nodes[sender.account] = {
        id: sender.account,
        label: sender.account,
        data: {
          fullname: sender.fullname,
          jobtitle: sender.jobtitle,
          ...(this.errorStates.includes(status) && {
            icon: this.buildIcon(status, isOriginal),
          }),
        },
      };
      nodes[recipient.account] = {
        id: recipient.account,
        label: recipient.account,
        data: {
          fullname: recipient.fullname,
          jobtitle: recipient.jobtitle,
          ...(!this.errorStates.includes(status) && {
            icon: this.buildIcon(status, isOriginal),
          }),
        },
      };
      links.push({
        id: `a-${index}`,
        source: sender.account,
        target: recipient.account,
        data: {
          class: status,
        },
      });
    });
    return { nodes: [...Object.values(nodes)], links: [...links] };
  }

  private buildIcon(status: string, isOriginal: boolean) {
    if (!isOriginal) {
      return status === communcationStatus.Archived
        ? 'images/archive-black.png'
        : 'images/copy-.png';
    }
    return status === communcationStatus.Archived
      ? 'images/archive.png'
      : 'images/copy.png';
  }

  protected openModal() {
    if (this.overlayRef.hasAttached()) {
      return;
    }

    const config = new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
    });

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.attach(this.portal);

    // Cuando se haga clic fuera del modal, se cerrará
    this.overlayRef.backdropClick().subscribe(() => this.closeModal());
  }

  protected closeModal(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose(); // ✅ Eliminar recursos
      // this.overlayRef = null; // ✅ Permitir futuras aperturas
    }
  }
}
