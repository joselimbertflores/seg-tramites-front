import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const routeTransition = trigger('routeTransition', [
  transition('* => *', [
    query(':enter', [style({ opacity: 0, scale: 0.9 })], { optional: true }),
    query(':leave', [animate('1s', style({ opacity: 0, scale: 0.9 }))], {
      optional: true,
    }),
  ]),
]);
