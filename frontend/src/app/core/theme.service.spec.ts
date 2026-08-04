import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to dark and sets the dark class', () => {
    const service = new ThemeService();
    service.init();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles to light and persists', () => {
    const service = new ThemeService();
    service.init();
    service.toggle();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('aetherium-theme')).toBe('light');
  });
});
