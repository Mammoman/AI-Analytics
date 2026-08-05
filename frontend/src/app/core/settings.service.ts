import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppSettings {
  refreshIntervalMs: number;
  notificationsEnabled: boolean;
}

const KEY = 'aetherium-settings';
const DEFAULTS: AppSettings = { refreshIntervalMs: 1500, notificationsEnabled: true };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private subject = new BehaviorSubject<AppSettings>(this.load());
  readonly settings$ = this.subject.asObservable();

  get current(): AppSettings {
    return this.subject.value;
  }

  setRefreshInterval(ms: number): void {
    this.update({ refreshIntervalMs: ms });
  }

  setNotificationsEnabled(on: boolean): void {
    this.update({ notificationsEnabled: on });
  }

  update(partial: Partial<AppSettings>): void {
    const next: AppSettings = { ...this.subject.value, ...partial };
    this.persist(next);
    this.subject.next(next);
  }

  reset(): void {
    this.persist(DEFAULTS);
    this.subject.next({ ...DEFAULTS });
  }

  private load(): AppSettings {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return {
        refreshIntervalMs:
          typeof parsed.refreshIntervalMs === 'number' ? parsed.refreshIntervalMs : DEFAULTS.refreshIntervalMs,
        notificationsEnabled:
          typeof parsed.notificationsEnabled === 'boolean'
            ? parsed.notificationsEnabled
            : DEFAULTS.notificationsEnabled,
      };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private persist(settings: AppSettings): void {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }
}
