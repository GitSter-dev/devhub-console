import { Injectable, signal } from '@angular/core';

export const DARK_CLASS = 'app-dark';
const THEME_KEY = 'devhub.console.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(initialDark());

  constructor() {
    apply(this.dark());
  }

  toggle(): void {
    this.dark.update((dark) => !dark);
    apply(this.dark());
    try {
      localStorage.setItem(THEME_KEY, this.dark() ? 'dark' : 'light');
    } catch {}
  }
}

function initialDark(): boolean {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      return stored === 'dark';
    }
  } catch {}
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function apply(dark: boolean): void {
  document.documentElement.classList.toggle(DARK_CLASS, dark);
}
