import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-landing-reports',
  imports: [],
  template: `
    <div class="flex items-center justify-center h-full w-full">
      <div class="max-w-2xl px-2">
        <div class="text-center mb-4">
          <h1 class="text-xl tracking-wide text-balance sm:text-4xl">
            Seccion de reportes
          </h1>
          <p class="mt-2 text-lg text-pretty sm:text-lg/8">
            Seleccione uno de los reportes disponibles para comenzar
          </p>
        </div>


        <ul class="space-y-2 list-disc ">
          <li>
            Ingrese la mayor cantidad de información posible para obtener
            resultados más precisos.
          </li>
          <li>
            Verifique que los datos ingresados sean correctos, especialmente
            nombres, números de referencia y fechas.
          </li>
          <li>
            Asegúrese de utilizar rangos de fechas adecuados para evitar
            resultados vacíos.
          </li>
          
        </ul>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingReportsComponent {}
