import { TestBed } from '@angular/core/testing';
import { RecentAlertsTableComponent } from './recent-alerts-table.component';
import { Alert } from '../core/metrics.model';

const alerts: Alert[] = [
  { level: 'Critical', message: 'Model drift detected', source: 'model-a', value: '12%' },
  { level: 'Warning', message: 'Latency spike', source: 'source-b', value: '450ms' },
  { level: 'Info', message: 'Retrain scheduled', source: 'scheduler', value: 'n/a' },
  { level: 'Critical', message: 'Data pipeline failure', source: 'pipeline-c', value: 'error' },
];

describe('RecentAlertsTableComponent', () => {
  it('computes criticalCount from the alerts input', () => {
    TestBed.configureTestingModule({ imports: [RecentAlertsTableComponent] });
    const fixture = TestBed.createComponent(RecentAlertsTableComponent);
    fixture.componentInstance.alerts = alerts;
    fixture.detectChanges();
    expect(fixture.componentInstance.criticalCount).toBe(2);
  });

  it('filters alerts to only Critical when selectedLevel is set to Critical', () => {
    TestBed.configureTestingModule({ imports: [RecentAlertsTableComponent] });
    const fixture = TestBed.createComponent(RecentAlertsTableComponent);
    fixture.componentInstance.alerts = alerts;
    fixture.componentInstance.selectedLevel = 'Critical';
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredAlerts.length).toBe(2);
    expect(fixture.componentInstance.filteredAlerts.every((a) => a.level === 'Critical')).toBe(true);
  });

  it('renders the critical count badge when there are critical alerts', () => {
    TestBed.configureTestingModule({ imports: [RecentAlertsTableComponent] });
    const fixture = TestBed.createComponent(RecentAlertsTableComponent);
    fixture.componentInstance.alerts = alerts;
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('2 Critical');
  });
});
