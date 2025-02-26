import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'empty-message',
  imports: [],
  template: `
    <div class="h-full mt-20 px-4 ">
      <div class="text-center">
        <img
          src="images/icons/empty.png"
          class="h-32 mx-auto"
          alt="Icon image"
        />
        <p class="mt-6 text-2xl font-semibold tracking-tight sm:text-4xl">
          {{ message() }}
        </p>
        @if(description()){
        <p class="mt-2">{{ description() }}</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyMessageComponent {
  message = input<string>('Sin resultados');
  description = input<string>('');
}
