import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  effect,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject, debounceTime, filter, takeUntil } from 'rxjs';

export type ServerSelectOption<T> = {
  text: string;
  value: T;
};

@Component({
    selector: 'server-select-search',
    imports: [
        CommonModule,
        MatInputModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
    ],
    templateUrl: './server-select-search.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerSelectSearchComponent<T> implements OnInit, OnDestroy {
  elements = input.required<ServerSelectOption<T>[]>();
  placeholder = input<string>('Buscar...');
  isRequired = input<boolean>(true);
  onSearch = output<string>();
  onSelect = output<T | undefined>();

  @Input() set initialValue(value: T) {
    this.bankCtrl.setValue(value);
  }

  public bankCtrl = new FormControl<T | null>(null);
  public bankFilterCtrl = new FormControl<string>('');
  public filteredBanks = new ReplaySubject<ServerSelectOption<T>[]>(1);
  protected _onDestroy = new Subject<void>();

  constructor() {
    effect(() => {
      this.filteredBanks.next(this.elements());
    });
  }

  ngOnInit(): void {
    this.bankFilterCtrl.valueChanges
      .pipe(
        // filter((search) => !!search),
        takeUntil(this._onDestroy),
        debounceTime(350)
      )
      .subscribe((value) => {
        this.onSearch.emit(value!);
      });
  }

  selectOption(value: T | undefined) {
    if (this.isRequired() && !value) return;
    this.onSelect.emit(value);
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
