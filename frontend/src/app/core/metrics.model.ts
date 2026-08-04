export interface Kpis {
  totalPredictions: number;
  modelAccuracy: number;
  dataPoints: number;
  activeModels: number;
}

export interface TrendPoint {
  t: string;
  actual: number;
  predicted: number;
}

export interface ModelUsage {
  name: string;
  percent: number;
}

export interface SourceLatency {
  name: string;
  ms: number;
}

export interface Alert {
  level: 'Critical' | 'Warning' | 'Info';
  message: string;
  source: string;
  value: string;
}

export interface TopModel {
  name: string;
  score: number;
  delta: number;
}

export interface MetricsSnapshot {
  timestamp: string;
  kpis: Kpis;
  accuracyTrend: TrendPoint[];
  modelUsage: ModelUsage[];
  sourceLatencies: SourceLatency[];
  recentAlerts: Alert[];
  topModels: TopModel[];
}
