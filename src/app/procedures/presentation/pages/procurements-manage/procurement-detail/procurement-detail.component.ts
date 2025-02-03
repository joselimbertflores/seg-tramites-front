import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { ProcurementService } from '../../../services';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BackButtonDirective } from '../../../../../shared';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-procurement-detail',
  imports: [MatToolbarModule, MatIconModule, BackButtonDirective],
  template: `
    <mat-toolbar>
      <button mat-icon-button backButton>
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span class="ml-4">Detalle</span>
      <span class="flex-1"></span>

      <button
        mat-icon-button
        class="example-icon"
        aria-label="Example icon-button with share icon"
      >
        <mat-icon>share</mat-icon>
      </button>
    </mat-toolbar>
    <div class="py-4 px-6">
      <!-- <div class="flow-root">
        <dl class="-my-3 divide-y divide-gray-100 text-sm">
          <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt class="font-medium text-gray-900">Title</dt>
            <dd class="text-gray-700 sm:col-span-2">Mr</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt class="font-medium text-gray-900">Name</dt>
            <dd class="text-gray-700 sm:col-span-2">John Frusciante</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt class="font-medium text-gray-900">Occupation</dt>
            <dd class="text-gray-700 sm:col-span-2">Guitarist</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt class="font-medium text-gray-900">Salary</dt>
            <dd class="text-gray-700 sm:col-span-2">$1,000,000+</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt class="font-medium text-gray-900">Bio</dt>
            <dd class="text-gray-700 sm:col-span-2">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Et
              facilis debitis explicabo doloremque impedit nesciunt dolorem
              facere, dolor quasi veritatis quia fugit aperiam aspernatur neque
              molestiae labore aliquam soluta architecto?
            </dd>
          </div>
        </dl>
      </div> -->
      <div class="py-4 sm:px-8">
        <div class="px-4 sm:px-0">
          <h3 class="text-xl text-gray-900">
            {{ data()?.tipo }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">
            {{ data()?.reference }}
          </p>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y divide-gray-100">
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">ALTERNO</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.code }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">CITE</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.cite ?? '----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">ESTADO</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.state }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                CANT. HOJAS / ANEXOS
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.numberOfDocuments }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">CREACION</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.createdAt }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">APERTURA</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.apertura ?? '-----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">PRECIO</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.precio ?? '-----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                CODIGO PROYECTO
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.codigoProyecto ?? '-----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                PLAZO DE EJECUCION
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.plazo ?? '-----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">MODALIDAD</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.modalidad ?? '-----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">CUCE</dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.cuce ?? '-----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                PRECIO ADJUDICADO
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.precioAdjudicado ?? '-----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                TIPO DE RESOLUCION
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.tipoResolucion ?? '-----' }}
              </dd>
            </div>
            <div class="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm/6 font-medium text-gray-900">
                EMPRESA ADJUDICADA
              </dt>
              <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ data()?.empreseAdjudicada ?? '-----' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProcurementDetailComponent implements OnInit {
  private procurementService = inject(ProcurementService);

  @Input('id') procedureId: string;

  data = signal<any | null>(null);

  ngOnInit(): void {
    this.procurementService.getDetail(this.procedureId).subscribe((resp) => {
      console.log(resp);
      this.data.set(resp);
    });
  }
}
