import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SourceLatency } from '../core/metrics.model';
import { CHART_SCHEME } from './chart-scheme';

@Component({
  selector: 'app-source-latency-bars',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/5 p-4">
      <h3 class="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Source Latency</h3>
      <div class="h-56">
        <ngx-charts-bar-vertical
          [results]="data"
          [scheme]="scheme"
          [xAxis]="true"
          [yAxis]="true"
        ></ngx-charts-bar-vertical>
      </div>
    </div>
  `,
})
export class SourceLatencyBarsComponent implements OnChanges {
  @Input() latencies: SourceLatency[] = [];

  scheme = CHART_SCHEME;
  data: { name: string; value: number }[] = [];

  ngOnChanges(): void {
    this.data = this.latencies.map((s) => ({ name: s.name, value: s.ms }));
  }
}
