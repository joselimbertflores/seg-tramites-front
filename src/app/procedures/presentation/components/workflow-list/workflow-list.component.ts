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
        @for (subitem of item; track $index) {
        <div class="flex"></div>
        }
      </mat-tab>
      }
    </mat-tab-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowListComponent implements OnInit {
  workflow = input.required<communication[]>();
  test = signal<any[]>([]);
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
    if (visited.has(currentCuenta))
      return currentCuenta === initialCuenta ? [path] : [];

    // Marca la cuenta actual como visitada
    visited.add(currentCuenta);

    // Filtra las comunicaciones que parten del nodo actual y busca recursivamente
    const paths = this.workflow()
      .filter((entry) => entry.sender.cuenta === currentCuenta)
      .flatMap((entry) => {
        const newPath = [...path, entry]; // Añade la comunicación actual al camino
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
