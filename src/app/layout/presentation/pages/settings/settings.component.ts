import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  FormBuilder,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { CustomFormValidators } from '../../../../helpers';
import {
  AlertService,
  AlertMessageComponent,
  FormErrorMessagesPipe,
  FieldValidationErrorMessages,
  BackButtonDirective,
} from '../../../../shared';

import {
  ThemeClass,
  ThemeColor,
  ThemeService,
  ThemeBackground,
  ThemeColorOption,
} from '../../services';
import { AuthService } from '../../../../auth/presentation/services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatTabsModule,
    FormErrorMessagesPipe,
    AlertMessageComponent,
    BackButtonDirective,
  ],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private _formBuilder = inject(FormBuilder);
  themeService = inject(ThemeService);

  protected errorMessages: FieldValidationErrorMessages = {
    password: {
      pattern:
        'Ingrese al menos una letra minúscula, una mayúscula y un número',
    },
    confirmPassword: {
      not_match: 'Las contraseñas no coinciden',
    },
  };

  protected user = this.authService.user;

  formUser = this._formBuilder.nonNullable.group(
    {
      password: [
        '',
        [
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: CustomFormValidators.matchFields(
        'password',
        'confirmPassword'
      ),
    }
  );

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isAlertShowing = signal(false);

  themes: ThemeColorOption[] = [
    { value: 'red', label: 'Rojo', code: '#ef9a9a' },
    { value: 'yellow', label: 'Amarillo', code: '#fff59d' },
    { value: 'green', label: 'Verde', code: '#a5d6a7' },
    { value: 'rose', label: 'Rosado', code: '#f48fb1' },
    { value: 'azure', label: 'Celeste', code: '#90caf9' },
  ];

  color = signal(this.themeService.currentTheme().split('-')[0] as ThemeColor);
  background = signal(
    this.themeService.currentTheme().split('-')[1] as ThemeBackground
  );
  theme = computed<ThemeClass>(() => `${this.color()}-${this.background()}`);

  ngOnInit(): void {
    this.showNotification();
  }

  updatePassword() {
    if (this.formUser.invalid) return;
    this.authService
      .updateMyUser(this.formUser.get('password')?.value!)
      .subscribe(() => {
        this.isAlertShowing.set(true);
        this.hidePassword.set(true);
        this.hideConfirmPassword.set(true);
        this.formUser.reset({});
      });
  }

  toggleHidePassword() {
    this.hidePassword.update((value) => !value);
  }

  toggleHideConfirmPassword() {
    this.hideConfirmPassword.update((value) => !value);
  }

  showNotification() {
    if (this.authService.updatedPassword()) return;
    this.alertService.messageDialog({
      title: 'Cambio Obligatorio de Contraseña',
      description:
        'Por razones de seguridad, es necesario que introduzca una nueva contraseña',
    });
  }

  changeTheme() {
    this.themeService.setTheme(this.theme());
  }
}
