import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'search-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-form-field>
      <mat-icon matPrefix>search</mat-icon>
      <mat-label>{{ title() }}</mat-label>
      <input
        matInput
        placeholder="Buscar"
        [formControl]="control"
        [placeholder]="placeholder()"
      />
      @if (control.value && clearable()) {
      <button matSuffix matIconButton aria-label="Clear" (click)="clear()">
        <mat-icon>close</mat-icon>
      </button>
      }
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnInit {
  title = input<string>('Buscar');
  placeholder = input<string>('Texto a buscar');
  initValue = input<string>('');
  clearable = input<boolean>(false);
  onSearch = output<string>();

  control = new FormControl<string>('', { nonNullable: true });

  constructor() {
    this.setupInput();
  }

  ngOnInit(): void {
    if (this.initValue()) this.control.setValue(this.initValue());
  }

  clear() {
    this.control.setValue('');
    this.onSearch.emit('');
  }

  private setupInput(): void {
    this.control.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.onSearch.emit(value));
  }
}
