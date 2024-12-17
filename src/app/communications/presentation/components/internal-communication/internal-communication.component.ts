import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InternalProcedure } from '../../../../procedures/domain';

@Component({
    selector: 'internal-communication',
    imports: [CommonModule],
    template: `
    <div class="py-4 sm:px-8">
      <div class="px-4 sm:px-0">
        <h3 class="text-base/7 font-semibold text-gray-900">
          {{ procedure().type }}
        </h3>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">
          {{ procedure().reference }}
        </p>
      </div>
      <div class="mt-6 border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">ALTERNO</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ procedure().code }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">CITE</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ procedure().citeCode }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">ESTADO</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ procedure().state }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">
              CANT. HOJAS / ANEXOS
            </dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ procedure().numberOfDocuments }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">CREACION</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ procedure().createdAt }}
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">REMITENTE</dt>
            <dd class="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <div class="flex flex-col gap-y-1">
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">Nombre:</dt>
                  <dd class="text-sm">
                    {{ procedure().emitter.fullname | titlecase }}
                  </dd>
                </div>
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">Cargo:</dt>
                  <dd class="text-sm">
                    {{ procedure().emitter.jobtitle }}
                  </dd>
                </div>
              </div>
            </dd>
          </div>
          <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">DESTINATARIO</dt>
            <dd class="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <div class="flex flex-col gap-y-1">
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">Nombre:</dt>
                  <dd class="text-sm">
                    {{ procedure().receiver.fullname | titlecase }}
                  </dd>
                </div>
                <div class="flex flex-row">
                  <dt class="text-sm font-medium w-20">Cargo:</dt>
                  <dd class="text-sm">
                    {{ procedure().receiver.jobtitle }}
                  </dd>
                </div>
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InternalCommunicationComponent {
  procedure = input.required<InternalProcedure>();
}
