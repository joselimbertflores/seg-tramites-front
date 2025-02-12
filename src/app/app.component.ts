import { Component, OnInit, Renderer2, effect, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './layout/presentation/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'seg-tramites-front';
  #document = inject(DOCUMENT);
  #renderer = inject(Renderer2);
  #themeService = inject(ThemeService);

  constructor() {
    effect(() => {
      this.#renderer.setAttribute(
        this.#document.documentElement,
        'class',
        'dark-mode'
      );
    });
  }

  ngOnInit(): void {}
}
