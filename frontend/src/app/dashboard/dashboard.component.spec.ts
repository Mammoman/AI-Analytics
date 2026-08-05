import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { MetricsSocketService } from '../core/metrics-socket.service';
import { MetricsSnapshot } from '../core/metrics.model';
import { ThemeService } from '../core/theme.service';
import { WidgetLayoutService, WidgetId } from './widget-layout.service';
import { MetricsHistoryService } from '../core/metrics-history.service';
import { ToastService } from '../core/toast.service';
import { SettingsService, AppSettings } from '../core/settings.service';

function makeSnapshot(overrides: Partial<MetricsSnapshot> = {}): MetricsSnapshot {
  return {
    timestamp: new Date().toISOString(),
    kpis: {
      totalPredictions: 100,
      modelAccuracy: 95,
      dataPoints: 1000,
      activeModels: 3,
    },
    accuracyTrend: [],
    modelUsage: [],
    sourceLatencies: [],
    recentAlerts: [],
    topModels: [],
    ...overrides,
  };
}

describe('DashboardComponent', () => {
  let snapshots$: Subject<MetricsSnapshot>;
  let connected$: BehaviorSubject<boolean>;
  let theme$: BehaviorSubject<'dark' | 'light'>;
  let settings$: BehaviorSubject<AppSettings>;
  let socketStub: {
    snapshots$: Subject<MetricsSnapshot>;
    connected$: BehaviorSubject<boolean>;
    connect: jasmine.Spy;
    disconnect: jasmine.Spy;
  };
  let themeStub: { theme$: BehaviorSubject<'dark' | 'light'> };
  let layoutStub: {
    getLayout: jasmine.Spy;
    setLayout: jasmine.Spy;
    remove: jasmine.Spy;
    add: jasmine.Spy;
    available: jasmine.Spy;
    reset: jasmine.Spy;
  };
  let settingsStub: { current: AppSettings; settings$: BehaviorSubject<AppSettings> };
  let toastStub: { show: jasmine.Spy };
  let historyStub: {
    push: jasmine.Spy;
    accuracyTrend: jasmine.Spy;
    kpiSeries: jasmine.Spy;
  };

  const fixedLayout: WidgetId[] = ['kpis', 'trend', 'donut', 'latency', 'alerts', 'topModels'];

  function setup() {
    snapshots$ = new Subject<MetricsSnapshot>();
    connected$ = new BehaviorSubject<boolean>(true);
    theme$ = new BehaviorSubject<'dark' | 'light'>('dark');
    settings$ = new BehaviorSubject<AppSettings>({ refreshIntervalMs: 1500, notificationsEnabled: true });

    socketStub = {
      snapshots$,
      connected$,
      connect: jasmine.createSpy('connect'),
      disconnect: jasmine.createSpy('disconnect'),
    };
    themeStub = { theme$ };
    layoutStub = {
      getLayout: jasmine.createSpy('getLayout').and.returnValue([...fixedLayout]),
      setLayout: jasmine.createSpy('setLayout'),
      remove: jasmine.createSpy('remove'),
      add: jasmine.createSpy('add'),
      available: jasmine.createSpy('available').and.returnValue([]),
      reset: jasmine.createSpy('reset'),
    };
    settingsStub = {
      current: { refreshIntervalMs: 1500, notificationsEnabled: true },
      settings$,
    };
    toastStub = { show: jasmine.createSpy('show') };
    historyStub = {
      push: jasmine.createSpy('push'),
      accuracyTrend: jasmine.createSpy('accuracyTrend').and.returnValue([]),
      kpiSeries: jasmine.createSpy('kpiSeries').and.returnValue([]),
    };

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MetricsSocketService, useValue: socketStub },
        { provide: ThemeService, useValue: themeStub },
        { provide: WidgetLayoutService, useValue: layoutStub },
        { provide: MetricsHistoryService, useValue: historyStub },
        { provide: ToastService, useValue: toastStub },
        { provide: SettingsService, useValue: settingsStub },
      ],
    });

    const fixture = TestBed.createComponent(DashboardComponent);
    return fixture;
  }

  it('stores the latest snapshot emitted on the socket stream after init', () => {
    const fixture = setup();
    fixture.detectChanges(); // ngOnInit -> subscribes to snapshots$

    expect(fixture.componentInstance.snapshot).toBeNull();

    const snap = makeSnapshot({ kpis: { totalPredictions: 42, modelAccuracy: 88, dataPoints: 500, activeModels: 2 } });
    snapshots$.next(snap);
    fixture.detectChanges();

    expect(fixture.componentInstance.snapshot).toBe(snap);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('42');

    fixture.componentInstance.ngOnDestroy();
  });

  it('ignores snapshots emitted while paused, and resumes updating once unpaused', () => {
    const fixture = setup();
    fixture.detectChanges();

    const snapA = makeSnapshot({ kpis: { totalPredictions: 1, modelAccuracy: 90, dataPoints: 100, activeModels: 1 } });
    snapshots$.next(snapA);
    fixture.detectChanges();
    expect(fixture.componentInstance.snapshot).toBe(snapA);

    fixture.componentInstance.togglePause();
    expect(fixture.componentInstance.paused).toBe(true);

    const snapB = makeSnapshot({ kpis: { totalPredictions: 2, modelAccuracy: 91, dataPoints: 200, activeModels: 1 } });
    snapshots$.next(snapB);
    fixture.detectChanges();
    // B ignored while paused; snapshot still A.
    expect(fixture.componentInstance.snapshot).toBe(snapA);

    fixture.componentInstance.togglePause();
    expect(fixture.componentInstance.paused).toBe(false);

    const snapC = makeSnapshot({ kpis: { totalPredictions: 3, modelAccuracy: 92, dataPoints: 300, activeModels: 1 } });
    snapshots$.next(snapC);
    fixture.detectChanges();
    expect(fixture.componentInstance.snapshot).toBe(snapC);

    fixture.componentInstance.ngOnDestroy();
  });

  it('toasts a new critical alert when notifications are enabled', () => {
    const fixture = setup();
    settingsStub.current.notificationsEnabled = true;
    fixture.detectChanges();

    const snap = makeSnapshot({
      recentAlerts: [{ level: 'Critical', message: 'Model drift', source: 'model-a', value: '12%' }],
    });
    snapshots$.next(snap);
    fixture.detectChanges();

    expect(toastStub.show).toHaveBeenCalledTimes(1);
    expect(toastStub.show).toHaveBeenCalledWith('Critical: Model drift (model-a)', 'Critical', 5000);

    fixture.componentInstance.ngOnDestroy();
  });

  it('does not toast a new critical alert when notifications are disabled', () => {
    const fixture = setup();
    settingsStub.current.notificationsEnabled = false;
    fixture.detectChanges();

    const snap = makeSnapshot({
      recentAlerts: [{ level: 'Critical', message: 'Data pipeline failure', source: 'pipeline-c', value: 'error' }],
    });
    snapshots$.next(snap);
    fixture.detectChanges();

    expect(toastStub.show).not.toHaveBeenCalled();

    fixture.componentInstance.ngOnDestroy();
  });
});
