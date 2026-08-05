import {
  alertsToRows,
  kpisToRows,
  modelUsageToRows,
  sourceLatenciesToRows,
  toCsv,
  toJson,
  topModelsToRows,
} from './export.util';
import { MetricsSnapshot } from './metrics.model';

const sampleSnapshot: MetricsSnapshot = {
  timestamp: '2026-08-05T12:00:00.000Z',
  kpis: {
    totalPredictions: 1000,
    modelAccuracy: 92.5,
    dataPoints: 50000,
    activeModels: 4,
  },
  accuracyTrend: [{ t: '12:00', actual: 90, predicted: 91 }],
  modelUsage: [
    { name: 'Model A', percent: 60 },
    { name: 'Model B', percent: 40 },
  ],
  sourceLatencies: [
    { name: 'Source A', ms: 120 },
    { name: 'Source B', ms: 250 },
  ],
  recentAlerts: [
    { level: 'Critical', message: 'Latency spike', source: 'Source A', value: '250ms' },
  ],
  topModels: [{ name: 'Model A', score: 98, delta: 1.2 }],
};

describe('toCsv', () => {
  it('returns empty string for empty array', () => {
    expect(toCsv([])).toBe('');
  });

  it('builds a header row and one row per data row', () => {
    const csv = toCsv([
      { name: 'Alpha', value: 1 },
      { name: 'Beta', value: 2 },
    ]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('name,value');
    expect(lines[1]).toBe('Alpha,1');
    expect(lines[2]).toBe('Beta,2');
  });

  it('quotes a field containing a comma', () => {
    const csv = toCsv([{ message: 'Hello, world', value: 1 }]);
    expect(csv.split('\n')[1]).toBe('"Hello, world",1');
  });

  it('quotes and escapes a field containing a double quote', () => {
    const csv = toCsv([{ message: 'Say "hi"', value: 1 }]);
    expect(csv.split('\n')[1]).toBe('"Say ""hi""",1');
  });
});

describe('toJson', () => {
  it('round-trips data', () => {
    const data = { a: 1, b: [1, 2, 3], c: 'text' };
    expect(JSON.parse(toJson(data))).toEqual(data);
  });
});

describe('section flatteners', () => {
  it('kpisToRows returns 4 rows with metric/value keys', () => {
    const rows = kpisToRows(sampleSnapshot);
    expect(rows.length).toBe(4);
    expect(Object.keys(rows[0])).toEqual(['metric', 'value']);
  });

  it('modelUsageToRows returns a row per model with model/percent keys', () => {
    const rows = modelUsageToRows(sampleSnapshot);
    expect(rows.length).toBe(2);
    expect(Object.keys(rows[0])).toEqual(['model', 'percent']);
  });

  it('sourceLatenciesToRows returns a row per source with source/ms keys', () => {
    const rows = sourceLatenciesToRows(sampleSnapshot);
    expect(rows.length).toBe(2);
    expect(Object.keys(rows[0])).toEqual(['source', 'ms']);
  });

  it('alertsToRows returns a row per alert with level/message/source/value keys', () => {
    const rows = alertsToRows(sampleSnapshot);
    expect(rows.length).toBe(1);
    expect(Object.keys(rows[0])).toEqual(['level', 'message', 'source', 'value']);
  });

  it('topModelsToRows returns a row per model with model/score/delta keys', () => {
    const rows = topModelsToRows(sampleSnapshot);
    expect(rows.length).toBe(1);
    expect(Object.keys(rows[0])).toEqual(['model', 'score', 'delta']);
  });
});

// downloadFile relies on document.createElement/Blob/URL DOM APIs that are
// awkward to assert on meaningfully in headless Karma without testing
// implementation details of the DOM click flow, so it is intentionally not
// unit tested here.
