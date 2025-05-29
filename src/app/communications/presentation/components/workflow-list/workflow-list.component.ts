import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { WorkflowTimelineComponent } from '../workflow-timeline/workflow-timeline.component';
import { workflow } from '../../../../communications/infrastructure';
import { getWorkflowPaths } from '../../../../communications/presentation/helpers';

@Component({
  selector: 'workflow-list',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    WorkflowTimelineComponent,
  ],
  template: `
    @if(paths().length === 1){
    <workflow-timeline
      [workflow]="paths()[0].path"
      [title]="paths()[0].title"
    />
    } @else {
    <div class="p-2 sm:p-6">
      <mat-accordion>
        @for (item of paths(); track $index) {
        <mat-expansion-panel [expanded]="$index === 0">
          <mat-expansion-panel-header>
            <mat-panel-title>
              @if(item.isOriginal) {
              <mat-icon style="color: var(--mat-sys-primary)"> task </mat-icon>
              } @else {
              <mat-icon style="color: var(--mat-sys-outline)">
                description
              </mat-icon>
              }
              <span class="sm:text-md ml-4"> {{ item.title | uppercase }}</span>
            </mat-panel-title>
          </mat-expansion-panel-header>
          <workflow-timeline [workflow]="item.path" [title]="item.title" />
        </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowListComponent {
  workflow = input.required<workflow[]>();
  paths = computed(() => getWorkflowPaths(this.workflow()));
}
