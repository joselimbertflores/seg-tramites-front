import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'search-input',
    imports: [
        CommonModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        MatButtonModule,
    ],
    templateUrl: './search-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchInputComponent {
  @Input() placeholder = 'Ingrese el termino a buscar';
  @Input() set initialValue(value: string) {
    this.FormSearch.setValue(value);
  }
  @Output() onSearch = new EventEmitter<string>();
  public FormSearch = new FormControl<string>('', [
    Validators.minLength(4),
    Validators.pattern(/^[^/!@#$%^&*()_+{}\[\]:;<>,.?~\\]*$/),
  ]);

  search() {
    if (this.FormSearch.invalid || this.FormSearch.value === '') return;
    this.onSearch.emit(this.FormSearch.value ?? '');
  }
  cancel() {
    this.FormSearch.reset('');
    this.onSearch.emit('');
  }

  get errorMessage(): string {
    if (this.FormSearch.hasError('minlength'))
      return 'Ingrese al menos 4 caracteres';
    return this.FormSearch.hasError('pattern')
      ? 'No se permiten caracteres especiales'
      : '';
  }
}
