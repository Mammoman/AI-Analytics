import { MetricsSnapshot } from './metrics.model';

export function toJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function toCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) {
    return '';
  }
  const keys = Object.keys(rows[0]);
  const escape = (value: string | number): string => {
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [keys.join(',')];
  for (const row of rows) {
    lines.push(keys.map((k) => escape(row[k])).join(','));
  }
  return lines.join('\n');
}

export function downloadFile(filename: string, content: string, mime: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function kpisToRows(snap: MetricsSnapshot): Record<string, string | number>[] {
  return [
    { metric: 'totalPredictions', value: snap.kpis.totalPredictions },
    { metric: 'modelAccuracy', value: snap.kpis.modelAccuracy },
    { metric: 'dataPoints', value: snap.kpis.dataPoints },
    { metric: 'activeModels', value: snap.kpis.activeModels },
  ];
}

export function modelUsageToRows(snap: MetricsSnapshot): Record<string, string | number>[] {
  return snap.modelUsage.map((m) => ({ model: m.name, percent: m.percent }));
}

export function sourceLatenciesToRows(snap: MetricsSnapshot): Record<string, string | number>[] {
  return snap.sourceLatencies.map((s) => ({ source: s.name, ms: s.ms }));
}

export function alertsToRows(snap: MetricsSnapshot): Record<string, string | number>[] {
  return snap.recentAlerts.map((a) => ({
    level: a.level,
    message: a.message,
    source: a.source,
    value: a.value,
  }));
}

export function topModelsToRows(snap: MetricsSnapshot): Record<string, string | number>[] {
  return snap.topModels.map((t) => ({ model: t.name, score: t.score, delta: t.delta }));
}
