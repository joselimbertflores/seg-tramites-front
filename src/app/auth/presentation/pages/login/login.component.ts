import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../presentation/services';

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        RouterModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    template: `
    <div class="min-h-screen flex items-center justify-center w-full">
      <div class="shadow-md rounded-lg p-5 mx-2 sm:mx-0 w-full sm:w-[450px]">
        <div class="sm:mx-auto mb-6">
          <img
            class="mx-auto h-16 mb-2"
            src="assets/images/icons/app.png"
            alt="Icon app"
          />
          <p class="text-center text-xl font-bold font-sans">
            Sistema de Seguimiento de Trámites
          </p>
          <p class="text-center">Inicio de sesion</p>
        </div>

        <form [formGroup]="loginForm" (submit)="login()" autocomplete="off">
          <div class="mb-2">
            <mat-form-field appearance="outline">
              <mat-label>Usuario</mat-label>
              <input
                matInput
                placeholder="Ingrese su usuario"
                formControlName="login"
              />
            </mat-form-field>
          </div>
          <div class="mb-2">
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                [autocomplete]="false"
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                placeholder="Ingrese su contraseña"
                formControlName="password"
              />
              <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword"
              >
                <mat-icon>{{
                  hidePassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
            </mat-form-field>
          </div>
          <div class="mb-4">
            <mat-checkbox formControlName="remember">
              Recordar nombre usuario
            </mat-checkbox>
          </div>
          <button type="submit" mat-flat-button class="w-full">Ingresar</button>
        </form>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LoginComponent {
  hidePassword = true;
  loginForm: FormGroup = this.fb.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
    remember: [false],
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const loginSaved = localStorage.getItem('login');
    if (!loginSaved) return;
    this.loginForm.patchValue({ login: loginSaved, remember: true });
  }

  login() {
    if (this.loginForm.invalid) return;
    this.authService.login(this.loginForm.value).subscribe(() => {
      this.router.navigateByUrl('/home');
    });
  }
}
