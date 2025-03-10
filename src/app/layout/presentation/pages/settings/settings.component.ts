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
import { MatExpansionModule } from '@angular/material/expansion';
import {
  AbstractControl,
  AbstractControlOptions,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { toSignal } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { CustomFormValidators } from '../../../../helpers';
import { SidenavButtonComponent } from '../../../../presentation/components';
import { NotificationComponent } from '../../../../presentation/components/notification/notification.component';
import {
  AuthService,
  AppearanceService,
} from '../../../../presentation/services';
import { ThemeSwitcherComponent } from '../../components';
import {
  AlertService,
  FieldValidationErrorMessages,
  FormErrorMessagesPipe,
} from '../../../../shared';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    MatToolbarModule,
    SidenavButtonComponent,
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
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private appearanceService = inject(AppearanceService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

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

  formUser = this.fb.group(
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

  dialogRef = inject(MatDialog);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  ngOnInit(): void {
    this.showNotification();
  }

  updatePassword() {
    if (this.formUser.invalid) return;
    this.authService
      .updateMyAccount(this.formUser.get('password')?.value!)
      .subscribe((resp) => {
        this.hidePassword.set(true);
        this.formUser.reset({});
        Object.keys(this.formUser.controls).forEach((key) => {
          this.formUser.get(key)?.setErrors(null);
          this.formUser.get(key)?.setErrors(null);
        });
        this.router.navigateByUrl('/home');
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
    this.dialogRef.open(NotificationComponent);
  }
}
