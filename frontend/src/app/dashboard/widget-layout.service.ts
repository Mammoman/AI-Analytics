import { Injectable } from '@angular/core';

export type WidgetId =
  | 'kpis' | 'trend' | 'donut' | 'latency' | 'alerts' | 'topModels';

export const ALL_WIDGETS: WidgetId[] = ['kpis', 'trend', 'donut', 'latency', 'alerts', 'topModels'];
const KEY = 'aetherium-layout';

@Injectable({ providedIn: 'root' })
export class WidgetLayoutService {
  private layout: WidgetId[] = this.load();

  private load(): WidgetId[] {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...ALL_WIDGETS];
    try {
      const parsed = JSON.parse(raw) as WidgetId[];
      return parsed.filter(id => ALL_WIDGETS.includes(id));
    } catch { return [...ALL_WIDGETS]; }
  }

  private persist(): void { localStorage.setItem(KEY, JSON.stringify(this.layout)); }

  getLayout(): WidgetId[] { return [...this.layout]; }
  setLayout(ids: WidgetId[]): void { this.layout = [...ids]; this.persist(); }
  remove(id: WidgetId): void { this.layout = this.layout.filter(x => x !== id); this.persist(); }
  add(id: WidgetId): void {
    if (!this.layout.includes(id) && ALL_WIDGETS.includes(id)) { this.layout.push(id); this.persist(); }
  }
  available(): WidgetId[] { return ALL_WIDGETS.filter(id => !this.layout.includes(id)); }
  reset(): void { this.layout = [...ALL_WIDGETS]; this.persist(); }
}
