import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AuthService } from '../../../auth/presentation/services/auth.service';


interface menu {
  label: string;
  link: string;
  description: string;
}
@Component({
    selector: 'app-reports',
    imports: [RouterModule, CommonModule, MaterialModule],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly permissionMappings: Record<string, menu> = {
    search: {
      label: 'Busquedas',
      link: 'search',
      description: 'Buscar cualquier tramite',
    },
    applicants: {
      label: 'Solicitante',
      link: 'applicant',
      description: 'Buscar por contribuyente',
    },
    dependents: {
      label: 'Dependientes',
      link: 'dependents',
      description: 'Listado de unidad',
    },
    unit: {
      label: 'Unidades',
      link: 'unit',
      description: 'Listado por unidad',
    },
  };
  public menu = signal<menu[]>([]);

  constructor() {}

  ngOnInit(): void {
    this._loadMenu();
  }

  private _loadMenu() {
    // const menu = this.authService
    //   .permissions()
    //   [VALID_RESOURCES.reports].map((action) => this.permissionMappings[action])
    //   .filter((item) => item);
    // this.menu.set(menu);
  }
}
