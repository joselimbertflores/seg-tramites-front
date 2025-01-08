import { animate, style, transition, trigger } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  // transition('* => slideIn', [
  //   style({ transform: 'translateX(100%)', opacity: 0 }),
  //   animate(
  //     '300ms ease-out',
  //     style({ transform: 'translateX(0)', opacity: 1 })
  //   ),
  // ]),
  // transition('slideIn => *', [
  //   style({ transform: 'translateX(-100%)', opacity: 0 }),
  //   animate(
  //     '300ms ease-out',
  //     style({ transform: 'translateX(0)', opacity: 1 })
  //   ),
  // ]),
  transition('* <=>  *', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 })),
  ]),
]);
