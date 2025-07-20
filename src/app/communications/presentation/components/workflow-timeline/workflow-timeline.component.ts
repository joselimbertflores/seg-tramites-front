import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { workflow } from '../../../../communications/infrastructure';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'workflow-timeline',
  imports: [CommonModule, MatTooltipModule],
  template: `
    <div class="container mx-auto sm:px-4 sm:py-8">
      <h2 class="sm:text-3xl font-bold text-center mb-12">
        {{ title() }}
      </h2>
      @for (item of workflow(); track $index) {
      <div
        class="mb-4 sm:mb-12 flex flex-col md:flex-row items-center justify-between w-full"
      >
        <!-- Emisor -->
        <div class="w-full md:w-5/12 px-4 order-1">
          <div class="border border-gray-200 shadow-md rounded-lg p-4">
            <p class="text-lg font-semibold text-blue-600 tracking-wider">
              Emisor
            </p>
            <p class="font-medium">
              {{ item.sender.fullname | titlecase }}
            </p>
            <p class="text-xs text-gray-500">
              {{ item.sender.jobtitle }}
            </p>
            <p class="mt-4 text-xs">
              {{ item.sender.dependency.nombre }} -
              {{ item.sender.institution.nombre }}
            </p>
            <div class="mt-2 text-xs space-y-1">
              <div class="flex items-center text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                Enviado: {{ item.sentDate | date : 'short' }}
              </div>
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Proveido: {{ item.reference }}
              </div>
            </div>
          </div>
        </div>

        <!-- Conector visual -->
        <div
          class="relative flex items-center justify-center w-full md:w-2/12 my-4 md:my-0 order-2 "  [matTooltip]="getStatusIcon(item.status).label"
        >
          <!-- Línea horizontal (solo desktop) -->
          <div
            class="hidden md:block absolute w-full h-0.5 bg-gray-200 top-1/2 z-0"
          ></div>

          <!-- Ícono dentro de círculo -->
          <div
            class="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md"
          >
            <span
              class="material-icons text-xl"
              [ngClass]="getStatusIcon(item.status).color"
            >
              {{ getStatusIcon(item.status).icon }}
            </span>
          </div>
          
        </div>

        <!-- Receptor -->
        <div class="w-full md:w-5/12 px-4 order-3">
          <div class="border border-gray-200 shadow-md rounded-lg p-4">
            <p class="text-lg font-semibold text-lime-600 tracking-wider">
              Receptor
            </p>
            <p class="font-medium">
              {{ item.recipient.fullname | titlecase }}
            </p>
            <p class="text-xs text-gray-500">
              {{ item.recipient.jobtitle }}
            </p>
            <p class="mt-4 text-xs">
              {{ item.recipient.dependency.nombre }} -
              {{ item.recipient.institution.nombre }}
            </p>

            <div class="mt-2 text-xs space-y-1">
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Recibido: {{ item.receivedDate | date : 'short' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-300 pt-4 md:hidden"></div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowTimelineComponent {
  title = input.required<string>();
  workflow = input.required<workflow[]>();

  getStatusIcon(status: string): { icon: string; color: string, label:string } {
    const map: Record<string, { icon: string; color: string,  label:string }> = {
      pending: { icon: 'hourglass_empty', color: 'text-yellow-500', label: 'Pendiente' },
      completed: { icon: 'check_circle', color: 'text-green-500', label: 'Completado' },
      rejected: { icon: 'cancel', color: 'text-red-500', label: 'Rechazado' },
      received: { icon: 'inbox', color: 'text-blue-500', label: 'Recibido' },
      forwarding: { icon: 'redo', color: 'text-indigo-500', label: 'Reenviado' },
      'auto-rejected': { icon: 'error', color: 'text-orange-500', label: 'Rechazo Automático' },
      archived: { icon: 'archive', color: 'text-gray-500', label: 'Archivado' },
    };

    return map[status] || { icon: 'help_outline', color: 'text-gray-400' };
  }
}
