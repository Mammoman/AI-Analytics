import { TestBed } from '@angular/core/testing';
import { PredictionsService } from './predictions.service';

describe('PredictionsService', () => {
  let service: PredictionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredictionsService);
  });

  afterEach(() => {
    service.stop();
  });

  function expectInRange(rows: ReturnType<PredictionsService['current']>) {
    for (const row of rows) {
      expect(row.predicted).toBeGreaterThanOrEqual(90);
      expect(row.predicted).toBeLessThanOrEqual(99.9);
      expect(row.confidence).toBeGreaterThanOrEqual(60);
      expect(row.confidence).toBeLessThanOrEqual(99.9);
      expect(['up', 'down', 'flat']).toContain(row.trend);
    }
  }

  it('generates 12 rows (4 models x 3 horizons)', () => {
    const rows = service.current();
    expect(rows.length).toBe(12);

    const models = new Set(rows.map((r) => r.model));
    const horizons = new Set(rows.map((r) => r.horizon));
    expect(models.size).toBe(4);
    expect(horizons.size).toBe(3);
  });

  it('has stable, unique ids derived from model and horizon', () => {
    const rows = service.current();
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(12);
    for (const row of rows) {
      expect(row.id).toBe(`${row.model}-${row.horizon}`);
    }
  });

  it('keeps predicted within [90, 99.9] and confidence within [60, 99.9] initially', () => {
    expectInRange(service.current());
  });

  it('keeps values in range across multiple refreshes', () => {
    for (let i = 0; i < 20; i++) {
      service.refresh();
      expectInRange(service.current());
    }
  });

  it('emits the same 12 row identities after refreshing', () => {
    const before = service.current().map((r) => r.id).sort();
    service.refresh();
    service.refresh();
    const after = service.current().map((r) => r.id).sort();
    expect(after).toEqual(before);
  });

  it('exposes predictions$ observable that emits on refresh', (done) => {
    let emissions = 0;
    const sub = service.predictions$.subscribe((rows) => {
      emissions++;
      expect(rows.length).toBe(12);
      if (emissions === 2) {
        sub.unsubscribe();
        done();
      }
    });
    service.refresh();
  });
});
