import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';

@Component({
    selector: 'app-loader',
    imports: [CommonModule, MaterialModule],
    template: `<mat-spinner
    [diameter]="100"
    color="primary"
    mode="indeterminate"
  ></mat-spinner>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {}
