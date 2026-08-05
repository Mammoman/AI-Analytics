import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to a 1500ms refresh interval and notifications enabled', () => {
    const service = new SettingsService();
    expect(service.current).toEqual({ refreshIntervalMs: 1500, notificationsEnabled: true });
  });

  it('setRefreshInterval persists and emits the new value', () => {
    const service = new SettingsService();
    const emitted: number[] = [];
    service.settings$.subscribe((s) => emitted.push(s.refreshIntervalMs));

    service.setRefreshInterval(3000);

    expect(service.current.refreshIntervalMs).toBe(3000);
    expect(emitted[emitted.length - 1]).toBe(3000);
    expect(JSON.parse(localStorage.getItem('aetherium-settings')!).refreshIntervalMs).toBe(3000);
  });

  it('setNotificationsEnabled persists and emits the new value', () => {
    const service = new SettingsService();
    service.setNotificationsEnabled(false);
    expect(service.current.notificationsEnabled).toBe(false);
    expect(JSON.parse(localStorage.getItem('aetherium-settings')!).notificationsEnabled).toBe(false);
  });

  it('reset restores defaults', () => {
    const service = new SettingsService();
    service.setRefreshInterval(5000);
    service.setNotificationsEnabled(false);

    service.reset();

    expect(service.current).toEqual({ refreshIntervalMs: 1500, notificationsEnabled: true });
    expect(JSON.parse(localStorage.getItem('aetherium-settings')!)).toEqual({
      refreshIntervalMs: 1500,
      notificationsEnabled: true,
    });
  });

  it('persists settings across a fresh instance via localStorage', () => {
    const first = new SettingsService();
    first.update({ refreshIntervalMs: 1000, notificationsEnabled: false });

    const second = new SettingsService();

    expect(second.current).toEqual({ refreshIntervalMs: 1000, notificationsEnabled: false });
  });

  it('falls back to defaults when localStorage contains invalid JSON', () => {
    localStorage.setItem('aetherium-settings', '{not-json');
    const service = new SettingsService();
    expect(service.current).toEqual({ refreshIntervalMs: 1500, notificationsEnabled: true });
  });
});
