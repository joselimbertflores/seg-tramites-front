import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { THEME_CLASSES } from '../../domain';

export type Theme = 'light' | 'dark';
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  currentTheme = signal<Theme>('light');

  updateThemeClass = effect(() => {
    // const theme = this.currentTheme();
    // document.body.classList.remove(...this.themes.map((t) => `${t.id}-theme`));
    // document.body.classList.add(`${theme.id}-theme`);
  });

  constructor() {
    effect(() => {
      localStorage.setItem('theme', this.currentTheme());
    });
  }

  changeTheme(newTheme: any) {
    // this._theme.set(newTheme);
  }

  getCurrentTheme(): any {
    const theme = localStorage.getItem('theme');
    return this.validateTheme(theme) ? theme : 'azure-light';
  }

  validateTheme(theme: string | null): theme is any {
    return THEME_CLASSES.some((validTheme) => validTheme === theme);
  }

  setTheme(theme: string) {
    this.document.documentElement.classList.remove(this.currentTheme());
    this.currentTheme.set(theme as any);
    this.document.documentElement.classList.add(theme);
    // this.document.documentElement.classList.add('dark-mode');
    // this.currentTheme.set(theme as any);

    // if (theme === 'dark') {
    // } else {
    //   this.document.documentElement.classList.remove('dark-mode');
    // }
  }

  testThem() {}
}
