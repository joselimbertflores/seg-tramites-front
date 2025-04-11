import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { communication } from '../../../../communications/infrastructure';
import { BadgeComponent } from '../../../../shared';

@Component({
  selector: 'workflow-list',
  imports: [CommonModule, BadgeComponent],
  template: `
    <div class=" overflow-y-scroll overflow-x-auto p-4">
      <table class="min-w-full divide-y-2 divide-gray-200 text-sm text-left">
        <thead class="font-medium">
          <tr>
            <th class="p-3 w-3/12">Emisor</th>
            <th class="p-3 w-3/12">Destinatario</th>
            <th class="p-3 w-3/12">Detalle</th>
            <th class="p-3 w-1/12">Status</th>
            <th class="p-3 w-1/12">Envio</th>
            <th class="p-3 w-1/12">Recepcion</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          @for (item of workflow(); track $index) {
          <tr>
            <td class="p-2">
              <div class="flex items-center gap-3">
                <img
                  src="images/icons/account.png"
                  class="inline-block relative object-cover object-center w-6 h-6 rounded-full"
                />
                <div class="flex flex-col">
                  <p class="font-medium">
                    {{ item.sender.fullname | titlecase }}
                  </p>
                  <span class="text-xs">{{ item.sender.jobtitle }}</span>
                </div>
              </div>
            </td>
            <td class="p-2">
              <div class="flex items-center gap-3">
                <img
                  src="images/icons/account.png"
                  class="inline-block relative object-cover object-center w-6 h-6 rounded-full"
                />
                <div class="flex flex-col">
                  <p class="font-medium">
                    {{ item.recipient.fullname | titlecase }}
                  </p>
                  <span class="text-xs">{{ item.recipient.jobtitle }}</span>
                </div>
              </div>
            </td>
            <td class="p-2 text-xs">
              <div class="flex flex-col">
                <div>
                  {{ item.reference }}
                </div>
                <div>Tipo: {{ item.isOriginal ? 'Original' : 'Copia' }}</div>
                @if(item.actionLog){
                <div class="mt-2">
                  <div class="block">
                    {{ item.actionLog.date | date : 'short' }}:
                  </div>
                  <div class="block">
                    {{ item.actionLog.fullname | titlecase }}:
                    {{ item.actionLog.description }}
                  </div>
                </div>
                }
              </div>
            </td>
            <td class="p-2">
              @switch (item.status) { @case ('pending') {
              <badge message="Pendiente" severity="warning" />
              } @case ('received') {
              <badge message="Recibido" severity="success" />
              } @case ('rejected') {
              <badge message="Rechazado" severity="danger" />
              } @case ('completed') {
              <badge message="Completado" />
              } @case ('auto-rejected') {
              <badge message="Expirado" severity="purple" />
              } @case ('forwarding') {
              <badge message="Reenviado" />
              } @case ('archived') {
              <badge message="Archivado" severity="info" />
              }@default {
              <p>{{ item.status }}</p>
              } }
            </td>
            <td class="p-2">{{ item.sentDate | date : 'short' }}</td>
            <td class="p-2">
              @if(item.receivedDate){
              {{ item.receivedDate | date : 'short' }}
              } @else { ---- }
            </td>
          </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowListComponent {
  workflow = input.required<communication[]>();
}
