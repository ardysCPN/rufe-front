import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkClass = 'dark';
  private storageKey = 'theme';

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved === 'dark' || (!saved && prefersDark)) {
      this.setDarkTheme();
    } else {
      this.setLightTheme();
    }
  }

  setDarkTheme(): void {
    document.documentElement.classList.add(this.darkClass);
    localStorage.setItem(this.storageKey, 'dark');
  }

  setLightTheme(): void {
    document.documentElement.classList.remove(this.darkClass);
    localStorage.setItem(this.storageKey, 'light');
  }

  toggleTheme(): void {
    const isDark = document.documentElement.classList.contains(this.darkClass);
    isDark ? this.setLightTheme() : this.setDarkTheme();
  }

  isDark(): boolean {
    return document.documentElement.classList.contains(this.darkClass);
  }
}
