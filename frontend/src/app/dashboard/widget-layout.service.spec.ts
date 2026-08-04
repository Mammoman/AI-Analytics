import { WidgetLayoutService, ALL_WIDGETS } from './widget-layout.service';

describe('WidgetLayoutService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to all widgets', () => {
    const s = new WidgetLayoutService();
    expect(s.getLayout()).toEqual([...ALL_WIDGETS]);
  });

  it('removes and re-adds a widget, persisting', () => {
    const s = new WidgetLayoutService();
    s.remove('donut');
    expect(s.getLayout()).not.toContain('donut');
    expect(s.available()).toContain('donut');
    const reloaded = new WidgetLayoutService();
    expect(reloaded.getLayout()).not.toContain('donut');
    s.add('donut');
    expect(s.getLayout()).toContain('donut');
  });
});
