import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';

@Component({
    selector: 'app-notification',
    imports: [CommonModule, MaterialModule],
    templateUrl: './notification.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {}
