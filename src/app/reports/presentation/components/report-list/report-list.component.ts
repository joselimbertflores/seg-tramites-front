import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';

interface menu {
  label: string;
  link: string;
  description: string;
}

@Component({
  selector: 'app-report-list',
  imports: [RouterModule, MatListModule, MatBottomSheetModule],
  template: `
    <mat-nav-list>
      @for (item of menu(); track $index) {
      <a [routerLink]="item.link" mat-list-item (click)="openLink($event)">
        <span matListItemTitle>{{ item.label }}</span>
        <span matLine>{{ item.description }}</span>
      </a>
      }
    </mat-nav-list>


    <!-- <mat-nav-list>
      @for (item of menu(); track $index) {
      <mat-list-item
        routerLinkActive
        #link="routerLinkActive"
        [activated]="link.isActive"
        (click)="navigateTo(item.link, drawer)"
      >
        <div class="label" matListItemTitle>{{ item.label }}</div>
        <span matListItemLine>{{ item.description }}</span>
      </mat-list-item>

      }
    </mat-nav-list> -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportListComponent {
  private _bottomSheetRef = inject(MatBottomSheetRef);
  menu = signal<menu[]>([
    {
      label: 'Busquedas',
      link: 'home/reports/search',
      description: 'Buscar cualquier tramite',
    },
    {
      label: 'Solicitante',
      link: 'home/reports/applicant',
      description: 'Buscar por contribuyente',
    },
  ]);

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
