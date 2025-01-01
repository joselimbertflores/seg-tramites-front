import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-archives',
  imports: [MatToolbarModule,MatButtonModule,MatIconModule],
  templateUrl: './archives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArchivesComponent {
  private location = inject(Location);
  
  back() {
    this.location.back();
  }
}
