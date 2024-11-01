import { Location } from '@angular/common';
import { Directive, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[backButton]',
  standalone: true,
})
export class BackButtonDirective {
  private localtion = inject(Location);

  @HostListener('click')
  onClick() {
    this.localtion.back();
  }
}
