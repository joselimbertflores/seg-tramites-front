import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { Edge, NgxGraphModule, Node } from '@swimlane/ngx-graph';
import { communication } from '../../../../communications/infrastructure';
@Component({
    selector: 'workflow-graph',
    imports: [CommonModule, NgxGraphModule],
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
          [nodeHeight]="150"
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
            <svg:g class="node" width="500" height="150">
              <svg:foreignObject width="500" height="150">
                <xhtml:div class="cardContainer bg-blue-50">
                  <div class="rounded-lg p-4  shadow-lg">
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowGraphComponent {
  workflow = input.required<communication[]>();
  graph = computed(() => this._createGraph(this.workflow()));

  private _createGraph(workflow: communication[]) {
    const nodes: Record<string, Node> = {};
    const links: Edge[] = [];
    workflow.forEach(({ sender, recipient, status }, index) => {
      nodes[sender.account] = {
        id: sender.account,
        label: sender.account,
        data: {
          fullname: sender.fullname,
          jobtitle: sender.jobtitle,
        },
      };
      nodes[recipient.account] = {
        id: recipient.account,
        label: recipient.account,
        data: {
          fullname: recipient.fullname,
          jobtitle: recipient.jobtitle,
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
}
