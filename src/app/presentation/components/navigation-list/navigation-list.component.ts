import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

interface Menu {
  resource: string;
  text: string;
  icon: string;
  routerLink: string;
  children?: {
    resource: string;
    text: string;
    icon: string;
    routerLink: string;
  }[];
}
@Component({
    selector: 'navigation-list',
    imports: [
        CommonModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatListModule,
        MatButtonModule,
        RouterModule,
        MatExpansionModule,
    ],
    templateUrl: './navigation-list.component.html',
    styleUrl: './navigation-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationListComponent {
  @Input({ required: true }) menu!: Menu[];
}
