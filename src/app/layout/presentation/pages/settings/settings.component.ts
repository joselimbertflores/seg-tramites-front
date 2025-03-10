import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  FormBuilder,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { CustomFormValidators } from '../../../../helpers';
import { NotificationComponent } from '../../../../presentation/components/notification/notification.component';
import {
  AuthService,
  AppearanceService,
} from '../../../../presentation/services';
import { ThemeSwitcherComponent } from '../../components';
import {
  AlertMessageComponent,
  AlertService,
  FieldValidationErrorMessages,
  FormErrorMessagesPipe,
} from '../../../../shared';
import { ThemeService } from '../../services/theme.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatExpansionModule,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatTabsModule,
    ThemeSwitcherComponent,
    FormErrorMessagesPipe,
    AlertMessageComponent,
    MatMenuModule,
  ],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private appearanceService = inject(AppearanceService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
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

  formUser = this.fb.nonNullable.group(
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

  themes = [
    { value: 'red-light', label: 'Rojo', code: '#ef9a9a' },
    { value: 'yellow-light', label: 'Amarillo', code: '#fff59d' },
    { value: 'green', label: 'Verde', code: '#a5d6a7' },
    { value: 'rose', label: 'Rosado', code: '#f48fb1' },
    { value: null, label: 'Celeste', code: '#90caf9' },
  ];

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

  get isDarkTheme() {
    return this.appearanceService.isDarkTheme();
  }

  toggleDarkTheme() {
    this.appearanceService.toggleTheme();
  }

  showNotification() {
    if (this.authService.updatedPassword()) return;
    this.alertService.messageDialog({
      title: 'Cambio Obligatorio de Contraseña',
      description:
        'Por razones de seguridad, es necesario que introduzca una nueva contraseña',
    });
  }

  changeTheme(value:string) {
    // this.themeService.changeTheme(`${this.color()}-${this.backgroud()}`);
    this.themeService.setTheme(value);
  }
}
