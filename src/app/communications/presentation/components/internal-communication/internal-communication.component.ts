import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InternalProcedure } from '../../../../procedures/domain';

@Component({
  selector: 'internal-communication',
  imports: [CommonModule],
  template: `
    <div class="p-2 sm:p-6">
      <dl class="-my-3 divide-y divide-gray-100 text-sm">
        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">Codigo</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().code }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">Referencia</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().reference }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">Cite</dt>
          <dd class=" sm:col-span-3">{{ procedure().citeCode }}</dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">Numero de documentos</dt>
          <dd class=" sm:col-span-3">{{ procedure().numberOfDocuments }}</dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">Fecha creacion</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().createdAt | date : 'short' }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">Estado</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().state }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">Remitente</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().sender.fullname | uppercase }}
          </dd>
        </div>

        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4">
          <dt class="font-medium ">Destinatario</dt>
          <dd class=" sm:col-span-3">
            {{ procedure().recipient.fullname | uppercase }}
          </dd>
        </div>
      </dl>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalCommunicationComponent {
  procedure = input.required<InternalProcedure>();
}
