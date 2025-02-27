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
  imports: [CommonModule, MatTabsModule],
  template: `
    <!-- <mat-tab-group>
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
                    {{ subitem.actionLog.fullname }}
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
    </mat-tab-group> -->

    <!-- Timeline -->
    <div class="p-6">
      <!-- Item -->
      <div class="flex gap-x-3">
        <!-- Icon -->
        <div
          class="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700"
        >
          <div class="relative z-10 size-7 flex justify-center items-center">
            <div
              class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
            ></div>
          </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pt-0.5 pb-8">
          <h3 class="flex gap-x-1.5 font-semibold text-gray-800 ">
            <svg
              class="shrink-0 size-4 mt-1"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
              ></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" x2="8" y1="13" y2="13"></line>
              <line x1="16" x2="8" y1="17" y2="17"></line>
              <line x1="10" x2="8" y1="9" y2="9"></line>
            </svg>
            Created "Preline in React" task
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
            Find more detailed insctructions here.
          </p>
          <div
            class="mt-1 -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg border border-transparent text-gray-500 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
          >
            <img
              class="shrink-0 size-4 rounded-full"
              src="https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8auto=format&fit=facearea&facepad=3&w=320&h=320&q=80"
              alt="Avatar"
            />
            James Collins
          </div>
          ha remitiro el tramite
        </div>
        <!-- End Right Content -->
      </div>
      <!-- End Item -->

      <!-- Item -->
      <div class="flex gap-x-3">
        <!-- Icon -->
        <div
          class="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700"
        >
          <div class="relative z-10 size-7 flex justify-center items-center">
            <div
              class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
            ></div>
          </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pt-0.5 pb-8">
          <h3 class="flex gap-x-1.5 font-semibold text-gray-800 ">
            Release v5.2.0 quick bug fix 🐞
          </h3>
          <button
            type="button"
            class="mt-1 -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
          >
            <span
              class="flex shrink-0 justify-center items-center size-4 bg-white border border-gray-200 text-[10px] font-semibold uppercase text-gray-600 rounded-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
            >
              A
            </span>
            Alex Gregarov
          </button>
        </div>
        <!-- End Right Content -->
      </div>
      <!-- End Item -->

      <!-- Item -->
      <div class="flex gap-x-3">
        <!-- Icon -->
        <div
          class="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700"
        >
          <div class="relative z-10 size-7 flex justify-center items-center">
            <div
              class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
            ></div>
          </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pt-0.5 pb-8">
          <h3 class="flex gap-x-1.5 font-semibold text-gray-800 ">
            Marked "Install Charts" completed
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
            Finally! You can check it out here.
          </p>
          <button
            type="button"
            class="mt-1 -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
          >
            <img
              class="shrink-0 size-4 rounded-full"
              src="https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80"
              alt="Avatar"
            />
            James Collins
          </button>
        </div>
        <!-- End Right Content -->
      </div>
      <!-- End Item -->

      <!-- Heading -->
      <div class="ps-2 my-2 first:mt-0">
        <h3
          class="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400"
        >
          31 Jul, 2023
        </h3>
      </div>
      <!-- End Heading -->

      <!-- Item -->
      <div class="flex gap-x-3">
        <!-- Icon -->
        <div
          class="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700"
        >
          <div class="relative z-10 size-7 flex justify-center items-center">
            <div
              class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
            ></div>
          </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pt-0.5 pb-8">
          <h3 class="flex gap-x-1.5 font-semibold text-gray-800 ">
            Take a break ⛳️
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
            Just chill for now... 😉
          </p>
        </div>
        <!-- End Right Content -->
      </div>
      <!-- End Item -->

      <!-- Collapse -->
      <div
        id="hs-timeline-collapse"
        class="hs-collapse hidden w-full overflow-hidden transition-[height] duration-300"
        aria-labelledby="hs-timeline-collapse-content"
      >
        <!-- Heading -->
        <div class="ps-2 my-2">
          <h3
            class="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400"
          >
            30 Jul, 2023
          </h3>
        </div>
        <!-- End Heading -->

        <!-- Item -->
        <div class="flex gap-x-3">
          <!-- Icon -->
          <div
            class="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700"
          >
            <div class="relative z-10 size-7 flex justify-center items-center">
              <div
                class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
              ></div>
            </div>
          </div>
          <!-- End Icon -->

          <!-- Right Content -->
          <div class="grow pt-0.5 pb-8">
            <h3 class="flex gap-x-1.5 font-semibold text-gray-800 ">
              Final touch ups
            </h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
              Double check everything and make sure we're ready to go.
            </p>
          </div>
          <!-- End Right Content -->
        </div>
        <!-- End Item -->
      </div>
      <!-- End Collapse -->
    </div>
    <!-- End Timeline -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowListComponent implements OnInit {
  workflow = input.required<communication[]>();
  test = signal<communication[][]>([]);
  ngOnInit(): void {
    console.log(this.workflow());
    this.test.set(this.findPaths(this.workflow()[0].sender.account));
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
      .filter((entry) => entry.sender.account === currentCuenta)
      .flatMap((entry) => {
        const newPath = [...path, entry];
        console.log(newPath); // Añade la comunicación actual al camino
        return this.findPaths(
          initialCuenta,
          entry.recipient.account,
          newPath,
          new Set(visited)
        );
      });

    // Si no hay caminos adicionales, devuelve el camino actual
    return paths.length ? paths : [path];
  }
}
