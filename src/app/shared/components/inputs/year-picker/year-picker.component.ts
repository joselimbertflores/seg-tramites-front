import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import moment from 'moment';
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'year-picker',
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Gestion</mat-label>
      <input
        matInput
        [matDatepicker]="dp"
        [formControl]="control"
        [min]="minDate"
        [max]="maxDate()"
      />
      <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
      <mat-datepicker
        #dp
        startView="multi-year"
        (yearSelected)="chosenYearHandler($event, dp)"
        panelClass="example-month-picker"
      >
      </mat-datepicker>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class YearPickerComponent {
  year = input<number>(new Date().getFullYear());
  control = new FormControl();

  onSelect = output<number>();

  maxDate = computed(() => new Date(this.year(), 11, 31));
  readonly minDate = new Date(2023, 0, 1);

  chosenYearHandler(normalizedYear: Moment, dp: any) {
    const ctrlValue = this.control.value;
    ctrlValue?.year(normalizedYear.year());
    this.control.setValue(ctrlValue);
    dp.close();
    this.onSelect.emit(normalizedYear.year());
  }
}
