import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'dark' | 'light';
const KEY = 'aetherium-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private subject = new BehaviorSubject<Theme>('dark');
  readonly theme$ = this.subject.asObservable();

  init(): void {
    const stored = (localStorage.getItem(KEY) as Theme | null) ?? 'dark';
    this.apply(stored);
  }

  toggle(): void {
    this.apply(this.subject.value === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(KEY, theme);
    this.subject.next(theme);
  }
}
