import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { locationResponse } from '../../../../infraestructure/interfaces';

@Component({
    selector: 'location',
    imports: [CommonModule, MatListModule, MatIconModule],
    templateUrl: './location.component.html',
    styleUrl: './location.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationComponent {
  data = input.required<locationResponse[]>();
}
