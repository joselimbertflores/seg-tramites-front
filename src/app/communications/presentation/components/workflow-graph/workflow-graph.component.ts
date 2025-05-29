import { CommonModule } from '@angular/common';
import {
  input,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClusterNode, Edge, NgxGraphModule, Node } from '@swimlane/ngx-graph';

import { workflow } from '../../../../communications/infrastructure';
import { communcationStatus } from '../../../../communications/domain';
@Component({
  selector: 'workflow-graph',
  imports: [CommonModule, NgxGraphModule, MatIconModule],
  template: `
    <div class="w-full h-[80vh] p-4">
      <div class="border border-black container h-full w-full">
        <ngx-graph
          [nodes]="graph().nodes"
          [links]="graph().links"
          [clusters]="graph().clusters"
          [animate]="false"
          [draggingEnabled]="false"
          [showMiniMap]="true"
          [autoCenter]="true"
          [nodeWidth]="380"
          [nodeHeight]="200"
          [autoZoom]="true"
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
                stroke="#666"
                stroke-width="1"
              />
              <svg:rect
                x="0"
                y="0"
                [attr.width]="cluster.dimension.width"
                height="28"
                fill="black"
                rx="5"
                ry="5"
              ></svg:rect>
              <svg:text
                fill="white"
                font-size="14"
                [attr.x]="cluster.dimension.width / 2"
                y="18"
                text-anchor="middle"
              >
                {{ cluster.label }}
              </svg:text>
            </svg:g>
          </ng-template>

          <ng-template #nodeTemplate let-node>
            <svg:foreignObject width="380" height="200">
              <div
                class="w-[380px] h-[200px] rounded-xl border border-black theme-color"
              >
                <div class="h-[30px] flex justify-end items-center px-2">
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
                stroke-width="5"
                [ngClass]="[link.data.class]"
                marker-end="url(#arrow)"
                [attr.stroke-dasharray]="link.data.original ? '0' : '5,5'"
              ></svg:path>
              <svg:text class="edge-label" text-anchor="middle">
                <textPath
                  class="text-path"
                  [attr.href]="'#' + link.id"
                  [style.dominant-baseline]="link.dominantBaseline"
                  startOffset="50%"
                  text-anchor="middle"
                  [style.font-size]="link.data.fontSize || '12px'"
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

    .theme-color{
      background-color:var(--mat-sys-surface-bright)
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowGraphComponent {
  workflow = input.required<workflow[]>();
  graph = computed(() => this.createGraph(this.workflow()));

  private errorStates: string[] = [
    communcationStatus.Rejected,
    communcationStatus.AutoRejected,
  ];

  private createGraph(workflow: workflow[]) {
    const nodes: Record<string, Node> = {};
    const links: Edge[] = [];
    const clusterMap = new Map<string, ClusterNode>();
    workflow.forEach(({ sender, recipient, status, isOriginal }, index) => {
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
          original: isOriginal,
        },
      });
      // Clusters (sender)
      if (!clusterMap.has(sender.dependency._id)) {
        clusterMap.set(sender.dependency._id, {
          id: sender.dependency._id,
          label: sender.dependency.nombre,
          childNodeIds: [],
        });
      }
      clusterMap.get(sender.dependency._id)!.childNodeIds!.push(sender.account);

      // Clusters (recipient)
      if (!clusterMap.has(recipient.dependency._id)) {
        clusterMap.set(recipient.dependency._id, {
          id: recipient.dependency._id,
          label: recipient.dependency.nombre, // lo podemos llenar si tienes el nombre
          childNodeIds: [],
        });
      }
      clusterMap
        .get(recipient.dependency._id)!
        .childNodeIds!.push(recipient.account);
    });

    return {
      nodes: [...Object.values(nodes)],
      links: [...links],
      clusters: Array.from(clusterMap.values()),
    };
  }
}
