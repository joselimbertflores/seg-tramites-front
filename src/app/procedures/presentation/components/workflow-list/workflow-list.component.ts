import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { communication } from '../../../../communications/infrastructure';

@Component({
  selector: 'workflow-list',
  standalone: true,
  imports: [CommonModule, MatTabsModule],
  template: `
    <mat-tab-group>
      @for (item of test(); track $index) {
      <mat-tab label="First">
        <div class="h-[78vh] p-4 overflow-y-scroll">
          @for (subitem of item; track $index) {
          <div class="flex sm:flex-row flex-col gap-x-12 items-center">
            <div class="flex-1 rounded shadow-md p-3 ring-1 ring-slate-300">
              <div class="font-medium text-sm py-2">
                Enviando el {{ subitem.sentDate | date : 'medium' }}
              </div>
              <div class="relative py-3 flex items-center gap-x-4">
                <img
                  src="assets/images/account.png"
                  alt="Image sender"
                  class="size-10 rounded-full bg-gray-50"
                />
                <div class="text-md">
                  <p class="font-medium">
                    {{ subitem.sender.fullname | titlecase }}
                  </p>
                  <p class="font-light">{{ subitem.sender.jobtitle }}</p>
                </div>
              </div>
              <div class="flex flex-col">
                <div class="flex gap-x-2">
                  <dt class="text-sm font-medium">Instruccion / Proveido:</dt>
                  <dd class="text-sm">
                    {{ subitem.reference }}
                  </dd>
                </div>
                <div class="flex gap-x-2">
                  <dt class="text-sm font-medium">Cant. Hojas / Anexos:</dt>
                  <dd class="text-sm">
                    {{ subitem.attachmentsCount }}
                  </dd>
                </div>
              </div>
            </div>
            <div class="h-10">
              {{ subitem.status }}
            </div>
            <div class="flex-1 rounded shadow-md p-3 ring-1 ring-slate-300">
              <div class="font-medium text-sm py-2">
                @if(subitem.receivedDate){ Recibido el
                {{ subitem.receivedDate | date : 'medium' }}
                } @else { Pendiente }
              </div>

              <div class="relative py-3 flex items-center gap-x-4">
                <img
                  src="assets/images/account.png"
                  alt="Image sender"
                  class="size-10 rounded-full bg-gray-50"
                />
                <div class="text-md">
                  <p class="font-medium">
                    {{ subitem.recipient.fullname | titlecase }}
                  </p>
                  <p class="font-light">{{ subitem.recipient.jobtitle }}</p>
                </div>
              </div>
              @if(subitem.actionLog){
              <div class="flex flex-col">
                <div class="flex gap-x-2">
                  <dt class="text-sm font-medium">Encargado:</dt>
                  <dd class="text-sm">
                    {{ subitem.actionLog.manager }}
                  </dd>
                </div>
                <div class="flex gap-x-2">
                  <dt class="text-sm font-medium">Accion:</dt>
                  <dd class="text-sm">
                    @switch (subitem.status) { @case ('rejected') {
                    <span class="text-red-600">RECHAZADO</span>
                    } @case ('archived') {
                    <span class="text-blue-600">ARCHIVADO</span>
                    } @case ('forwarding') {
                    <span>REEENVIADO</span>
                    }@default { ----- } }
                  </dd>
                </div>
                <div class="flex gap-x-2">
                  <dt class="text-sm font-medium">Descripcion:</dt>
                  <dd class="text-sm">{{ subitem.actionLog.description }}</dd>
                </div>
                <div class="flex gap-x-2">
                  <dt class="text-sm font-medium">Fecha:</dt>
                  <dd class="text-sm">
                    {{ subitem.actionLog.date | date : 'short' }}
                  </dd>
                </div>
              </div>
              }
            </div>
          </div>
          }
        </div>
      </mat-tab>
      }
    </mat-tab-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowListComponent implements OnInit {
  workflow = input.required<communication[]>();
  test = signal<communication[][]>([]);
  ngOnInit(): void {
    this.test.set(this.findPaths(this.workflow()[0].sender.cuenta));
    console.log(this.test());
  }

  findPaths(
    initialCuenta: string,
    currentCuenta: string = initialCuenta,
    path: communication[] = [],
    visited: Set<string> = new Set()
  ): communication[][] {
    // Detecta un ciclo y retorna el camino si vuelve al nodo inicial
    if (visited.has(currentCuenta)) {
      return currentCuenta === initialCuenta ? [path] : [];
    }

    // Marca la cuenta actual como visitada
    visited.add(currentCuenta);

    // Filtra las comunicaciones que parten del nodo actual y busca recursivamente
    const paths = this.workflow()
      .filter((entry) => entry.sender.cuenta === currentCuenta)
      .flatMap((entry) => {
        const newPath = [...path, entry];
        console.log(newPath); // Añade la comunicación actual al camino
        return this.findPaths(
          initialCuenta,
          entry.recipient.cuenta,
          newPath,
          new Set(visited)
        );
      });

    // Si no hay caminos adicionales, devuelve el camino actual
    return paths.length ? paths : [path];
  }
}
