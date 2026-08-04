import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ModelUsage } from '../core/metrics.model';
import { CHART_SCHEME } from './chart-scheme';

@Component({
  selector: 'app-model-usage-donut',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="rounded-xl bg-slate-900 ring-1 ring-white/5 p-4">
      <h3 class="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Model Usage</h3>
      <div class="h-56">
        <ngx-charts-pie-chart
          [results]="data"
          [scheme]="scheme"
          [doughnut]="true"
          [labels]="true"
          [legend]="true"
        ></ngx-charts-pie-chart>
      </div>
    </div>
  `,
})
export class ModelUsageDonutComponent implements OnChanges {
  @Input() usage: ModelUsage[] = [];

  scheme = CHART_SCHEME;
  data: { name: string; value: number }[] = [];

  ngOnChanges(): void {
    this.data = this.usage.map((u) => ({ name: u.name, value: u.percent }));
  }
}
