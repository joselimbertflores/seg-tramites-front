import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnInit,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type SimpleSelectOption<T> = {
  text: string;
  value: T;
};
@Component({
    selector: 'simple-select-search',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgxMatSelectSearchModule,
        MatFormFieldModule,
        MatSelectModule,
    ],
    template: `
    <mat-form-field>
      <mat-select
        [formControl]="bankCtrl"
        [placeholder]="placeholder()"
        (selectionChange)="selectOption($event.value)"
      >
        <mat-option>
          <ngx-mat-select-search
            placeholderLabel="Ingrese el termino a buscar"
            noEntriesFoundLabel="Sin resultados"
            [formControl]="bankFilterCtrl"
          ></ngx-mat-select-search>
        </mat-option>
        <!-- @if(bankCtrl.value && !isRequired()){
        <mat-option>-- Ninguno --</mat-option>
        } -->
        <mat-option
          *ngFor="let bank of filteredBanks | async"
          [value]="bank.value"
        >
          {{ bank.text }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleSelectSearchComponent<T> implements OnInit {
  private destroyRef = inject(DestroyRef);

  value = input<T>();
  elements = input.required<SimpleSelectOption<T>[]>();
  placeholder = input<string>('Buscar....');
  isRequired = input<boolean>(true);
  onSelect = output<T | undefined>();

  bankCtrl = new FormControl();
  public bankFilterCtrl = new FormControl<string>('');
  public filteredBanks = new ReplaySubject<SimpleSelectOption<T>[]>(1);

  constructor() {
    effect(() => {
      this.filteredBanks.next(this.elements());
    });
  }

  ngOnInit(): void {
    this.bankCtrl.setValue(this.value());
    this.bankFilterCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filterBanks());
  }

  selectOption(value: T | undefined) {
    if (this.isRequired() && !value) return;
    this.onSelect.emit(value);
  }

  protected filterBanks() {
    if (!this.elements()) return;
    let search = this.bankFilterCtrl.value;
    if (!search) {
      this.filteredBanks.next(this.elements().slice());
      return;
    }
    this.filteredBanks.next(
      this.elements().filter(
        (bank) => bank.text.toLowerCase().indexOf(search!.toLowerCase()) > -1
      )
    );
  }
}
