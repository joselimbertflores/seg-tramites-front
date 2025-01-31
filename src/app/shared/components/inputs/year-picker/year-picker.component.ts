import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
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
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
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
        [matDatepicker]="picker"
        [formControl]="control"
        [min]="minDate"
        [max]="maxDate"
      />
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker
        #picker
        startView="multi-year"
        (yearSelected)="chosenYearHandler($event, picker)"
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
export class YearPickerComponent implements OnInit {
  private readonly _currentYear = new Date().getFullYear();

  year = input<number>(this._currentYear);
  control = new FormControl<null | _moment.Moment>(null);

  onSelect = output<number>();

  readonly minDate = new Date(2023, 0, 1);
  readonly maxDate = new Date(this._currentYear, 11, 31);

  ngOnInit(): void {
    this.control.setValue(moment().year(this.year()));
  }

  chosenYearHandler(normalizedYear: Moment, picker: MatDatepicker<any>) {
    this.control.setValue(moment().year(normalizedYear.year()));
    picker.close();
    this.onSelect.emit(normalizedYear.year());
  }
}
