import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TrendPoint } from '../core/metrics.model';
import { CHART_SCHEME } from './chart-scheme';

@Component({
  selector: 'app-accuracy-trend-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 p-4">
      <h3 class="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Accuracy Trend</h3>
      <div class="h-56">
        <ngx-charts-area-chart
          [results]="data"
          [scheme]="scheme"
          [xAxis]="true"
          [yAxis]="true"
          [gradient]="false"
          [autoScale]="true"
          [legend]="true"
        ></ngx-charts-area-chart>
      </div>
    </div>
  `,
})
export class AccuracyTrendChartComponent implements OnChanges {
  @Input() points: TrendPoint[] = [];

  scheme = CHART_SCHEME;
  data: { name: string; series: { name: string; value: number }[] }[] = [];

  ngOnChanges(): void {
    this.data = [
      { name: 'Actual', series: this.points.map((p) => ({ name: p.t, value: p.actual })) },
      { name: 'Predicted', series: this.points.map((p) => ({ name: p.t, value: p.predicted })) },
    ];
  }
}
