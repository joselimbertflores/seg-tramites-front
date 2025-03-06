import { CommonModule } from '@angular/common';
import {
  input,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Edge, NgxGraphModule, Node } from '@swimlane/ngx-graph';

import { communication } from '../../../../communications/infrastructure';
import { communcationStatus } from '../../../../communications/domain';
@Component({
  selector: 'workflow-graph',
  imports: [CommonModule, NgxGraphModule, MatIconModule],
  template: `
    <div class="w-full h-[80vh] p-4">
      <div class="border border-black container h-full bg-gray-100">
        <ngx-graph
          [nodes]="graph().nodes"
          [links]="graph().links"
          [draggingEnabled]="false"
          [showMiniMap]="true"
          [autoCenter]="true"
          [nodeWidth]="380"
          [nodeHeight]="200"
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
            <svg:foreignObject width="380" height="200">
              <div
                class="w-[380px] h-[200px] rounded-xl border border-black bg-blue-50"
              >
                <div class="h-[30px] flex justify-end items-center  px-2">
                  @if(node.data.location){
                  <mat-icon>article</mat-icon>
                  }
                </div>
                <div class="flex flex-col items-center text-center">
                  <img
                    class="w-12 mb-3 rounded-full"
                    src="images/icons/account.png"
                  />
                  <h5 class="mb-1 text-xl font-medium">
                    {{ node.data.officer.fullname | titlecase }}
                  </h5>
                  <span class="text-sm">{{ node.data.officer.jobtitle }}</span>
                </div>
              </div>
            </svg:foreignObject>
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
                >
                  {{ link.label }}
                </textPath>
              </svg:text>
            </svg:g>
          </ng-template>
        </ngx-graph>
      </div>
    </div>
  `,
  styles: `
    .pending {
      stroke: #FF8C42;
    }
    .rejected, .forwarding {
      stroke: #EF233C;
      stroke-dasharray: 4 4;
    }
    .auto-rejected {
      stroke: #8338EC;
      stroke-dasharray: 4 4;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowGraphComponent {
  workflow = input.required<communication[]>();
  graph = computed(() => this.createGraph(this.workflow()));

  private errorStates: string[] = [
    communcationStatus.Rejected,
    communcationStatus.AutoRejected,
  ];

  private createGraph(workflow: communication[]) {
    const nodes: Record<string, Node> = {};
    const links: Edge[] = [];
    workflow.forEach(({ sender, recipient, status }, index) => {
      nodes[sender.account] = {
        id: sender.account,
        label: sender.account,
        data: {
          officer: {
            fullname: sender.fullname,
            jobtitle: sender.jobtitle,
          },
          ...(this.errorStates.includes(status) && { location: true }),
        },
      };
      nodes[recipient.account] = {
        id: recipient.account,
        label: recipient.account,
        data: {
          officer: {
            fullname: recipient.fullname,
            jobtitle: recipient.jobtitle,
          },
          ...(!this.errorStates.includes(status) && { location: true }),
        },
      };
      links.push({
        id: `link-${index}`,
        source: sender.account,
        target: recipient.account,
        label: (index + 1).toString(),
        data: {
          class: status,
        },
      });
    });
    console.log('NODES', [...Object.values(nodes)]);
    console.log('LINKS', [...links]);
    return { nodes: [...Object.values(nodes)], links: [...links] };
  }
}
