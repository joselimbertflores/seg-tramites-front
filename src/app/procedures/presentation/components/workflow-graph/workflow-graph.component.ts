import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
} from '@angular/core';
import { Edge, NgxGraphModule, Node } from '@swimlane/ngx-graph';
import { communication } from '../../../../communications/infrastructure';

@Component({
  selector: 'workflow-graph',
  standalone: true,
  imports: [CommonModule, NgxGraphModule],
  template: `
    <div class="w-full h-[80vh]">
      <ngx-graph
        class="chart-container"
        [links]="graph().links"
        [nodes]="graph().nodes"
        [draggingEnabled]="false"
        [enableZoom]="true"
        [showMiniMap]="true"
        [autoCenter]="true"
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
          <svg:g class="node">
            <svg:rect
              [attr.width]="node.dimension.width"
              [attr.height]="node.dimension.height"
              [attr.fill]="node.data.color"
            />
            <svg:text
              alignment-baseline="central"
              [attr.x]="10"
              [attr.y]="node.dimension.height / 2"
            >
              {{ node.label }}
            </svg:text>
          </svg:g>
        </ng-template>

        <ng-template #linkTemplate let-link>
          <svg:g class="edge">
            <svg:path
              class="line"
              stroke-width="2"
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
  `,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowGraphComponent implements OnInit {
  workflow = input.required<communication[]>();

  graph = computed<{ nodes: Node[]; links: Edge[] }>(() => {
    return this.createChar(this.workflow());
  });

  ngOnInit() {}

  createChar(workflow: communication[]) {
    const nodes: Record<string, Node> = {};
    const links: any[] = [];
    workflow.forEach(({ sender, recipient }, index) => {
      nodes[sender.cuenta] = {
        id: sender.cuenta,
        label: 'TExt',
        // data: {
        //   fullname: sender.fullname,
        //   jobtitle: sender.jobtitle,
        // },
      };
      nodes[recipient.cuenta] = {
        id: recipient.cuenta,
        label: 'TExt',
      };
      links.push({
        id: `a-${index}`,
        source: sender.cuenta,
        target: recipient.cuenta,
      });
    });
    return { nodes: [...Object.values(nodes)], links: [...links] };
  }
}
