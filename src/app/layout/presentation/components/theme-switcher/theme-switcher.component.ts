import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ThemeColor, THEME_OPTIONS } from '../../../domain';
import { ThemeService } from '../../services/theme.service';


type ThemeParts = [ThemeColor, 'light' | 'dark'];
@Component({
    selector: 'theme-switcher',
    imports: [
        CommonModule,
        MatIconModule,
        FormsModule,
        MatSelectModule,
        MatButtonToggleModule,
    ],
    template: `
    <div>
      <div class="px-4 sm:px-0">
        <p class="text-base font-semibold">Estilo principal</p>
        <p class="max-w-2xl text-sm">
          Cambie el tema y color principal de sus vistas
        </p>
      </div>
      <div class="mt-6 border-t">
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6">Tema</dt>
            <dd class="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
              <mat-button-toggle-group
                aria-label="Theme switcher"
                [(ngModel)]="backgroud"
                (change)="changeTheme()"
              >
                <mat-button-toggle value="light">
                  <mat-icon>light_mode</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="dark">
                  <mat-icon>dark_mode</mat-icon>
                </mat-button-toggle>
              </mat-button-toggle-group>
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 ">Color</dt>
            <dd class="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
              <mat-form-field class="max-w-60">
                <mat-label>Seleccione el color {{ color() }}</mat-label>
                <mat-select
                  [(ngModel)]="color"
                  (selectionChange)="changeTheme()"
                >
                  @for (theme of themeOptions; track $index) {
                  <mat-option [value]="theme.value">
                    <span
                      class="inline-flex items-center font-bold px-2 py-1 rounded-md"
                      [ngStyle]="{ 'background-color': theme.value }"
                    >
                      {{ theme.label }}
                    </span>
                  </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSwitcherComponent {
  private themeService = inject(ThemeService);
  themeOptions = THEME_OPTIONS;

  color = signal<ThemeColor>(this.themeParts[0]);
  backgroud = signal<'light' | 'dark'>(this.themeParts[1]);

  changeTheme() {
    this.themeService.changeTheme(`${this.color()}-${this.backgroud()}`);
  }

  private get themeParts(): ThemeParts {
    return this.themeService.theme().split('-') as ThemeParts;
  }
}
