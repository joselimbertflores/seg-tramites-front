import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    RouterModule,
    MatFormFieldModule,
    FormField,
    FormRoot,
    MatCheckboxModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div
      class="main flex min-h-screen w-full items-center justify-center px-4 py-8"
    >
      <div
        class="box w-full max-w-[450px] rounded-xl px-5 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-9"
      >
        <div class="sm:mx-auto mb-6">
          <img
            class="mx-auto h-16 mb-4"
            src="images/icons/app.png"
            alt="Icon app"
          />
          <p class="text-center text-xl font-bold font-sans">
            Sistema de Seguimiento de Trámites
          </p>
          <p class="text-center">Inicio de sesión</p>
        </div>

        @if (ssoError()) {
          <p role="alert" class="mb-4 text-sm">{{ ssoError() }}</p>
        }

        <form [formRoot]="loginForm" autocomplete="on">
          <div class="mb-2">
            <mat-form-field appearance="outline">
              <mat-label>Usuario</mat-label>
              <input
                matInput
                type="text"
                autocomplete="username"
                placeholder="Ingrese su usuario"
                [formField]="loginForm.login"
              />
            </mat-form-field>
          </div>

          <div class="mb-2">
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                autocomplete="current-password"
                placeholder="Ingrese su contraseña"
                [formField]="loginForm.password"
              />
            </mat-form-field>
          </div>

          <div class="mb-4">
            <mat-checkbox [formField]="loginForm.remember">
              Recordar usuario
            </mat-checkbox>
          </div>

          <button
            type="submit"
            matButton="filled"
            [disabled]="loginForm().submitting()"
            class="w-full"
          >
            @if (loginForm().submitting()) {
              <mat-spinner [diameter]="25" [strokeWidth]="3" />
            } @else {
              Ingresar
            }
          </button>
        </form>
        <button
          type="button"
          class="mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[var(--mat-sys-outline-variant)] bg-[var(--mat-sys-surface)] px-4 text-base font-medium text-[var(--mat-sys-on-surface)] transition-colors hover:bg-[var(--mat-sys-surface-container-low)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mat-sys-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          (click)="loginWithIdentityHub()"
        >
          <img
            src="branding/identity-hub-mark.svg"
            alt=""
            class="h-6 w-6 shrink-0 object-contain"
          />
          <span>Iniciar sesión con SIAU</span>
        </button>

        <footer
          class="mt-6 border-t border-[var(--mat-sys-outline-variant)] pt-4"
        >
          <div
            class="flex items-center justify-center gap-3 text-[var(--mat-sys-on-surface-variant)]"
          >
            <img
              src="branding/sacaba-mark.svg"
              alt=""
              class="h-10 w-10 shrink-0 object-contain"
            />
            <span class="text-center text-xs font-medium leading-5">
              Gobierno Autónomo Municipal de Sacaba
            </span>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: `
    .main {
      background-color: var(--mat-sys-surface-container);
    }
    .box {
      box-shadow: var(--mat-sys-level2);
      background-color: var(--mat-sys-surface);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  hidePassword = true;
  loginModel = signal({
    login: '',
    password: '',
    remember: false,
  });
  loginForm = form(
    this.loginModel,
    (schemaPath) => {
      required(schemaPath.login);
      required(schemaPath.password);
    },
    {
      submission: {
        action: async (field) => {
          try {
            await firstValueFrom(this.authService.login(field().value()));
            void this.router.navigateByUrl('/home');
          } catch {}
        },
      },
    },
  );
  ssoError = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error) {
      const messages: Record<string, string> = {
        not_provisioned:
          'Su usuario institucional no está provisionado en Seguimiento de Trámites. Contacte al administrador.',
        access_denied:
          'Identity Hub no autorizó el acceso a Seguimiento de Trámites.',
        invalid_state:
          'El intento de inicio de sesión expiró o ya fue utilizado. Intente nuevamente.',
        identity_hub_unavailable:
          'Identity Hub no está disponible temporalmente. Intente nuevamente.',
        session_unavailable:
          'No fue posible comprobar su sesión temporalmente. Intente nuevamente.',
      };
      this.ssoError.set(
        messages[error] ??
          'No fue posible iniciar sesión con Identity Hub. Intente nuevamente.',
      );
    }
    const loginSaved = localStorage.getItem('login');
    if (!loginSaved) return;
    this.loginModel.update((model) => ({
      ...model,
      login: loginSaved,
      remember: true,
    }));
  }

  loginWithIdentityHub(): void {
    this.authService.loginWithIdentityHub();
  }
}
