import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BehaviorSubject, takeUntil } from 'rxjs';

export type selectOption<T> = {
  label: string;
  value: T;
};

@Component({
  selector: 'app-select-search',
  imports: [NgxMatSelectSearchModule],
  template: `<p>select-search works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSearchComponent<T> implements OnInit {
  private destroyRef = inject(DestroyRef);

  items = input<selectOption<T>[]>();
  autoFilter = input<boolean>(false);
  onTyped = output<string>();

  /** list of banks */
  protected banks: Bank[] = BANKS;

  /** control for the selected bank */
  public bankCtrl: FormControl<Bank> = new FormControl<Bank>(null);

  /** control for the MatSelect filter keyword */
  public bankFilterCtrl: FormControl<string> = new FormControl<string>('');

  filteredOptions = new BehaviorSubject<selectOption<T>[]>([]);

  ngOnInit(): void {
    this.bankFilterCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        this.onTyped.emit(value);
        if (this.autoFilter()) {
          this.filter(value);
        }
      });
  }

  filter(term: string | undefined): void {
    // const elements = term
    //   ? this.items().filter(({ text }) =>
    //       text.toLowerCase().includes(term.toLowerCase())
    //     )
    //   : this.options().slice();
    // this.filteredOptions.next(elements);
  }
}
