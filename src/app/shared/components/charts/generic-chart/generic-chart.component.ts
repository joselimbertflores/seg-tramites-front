import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
} from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export interface GeneriChartData extends ChartData {}
@Component({
  selector: 'generic-chart',
  imports: [BaseChartDirective],
  template: `
    <canvas
      baseChart
      [title]="title()"
      [data]="chartData()"
      [type]="chartType()"
      [options]="chartOptions()"
      [plugins]="chartPlugins"
    >
    </canvas>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericChartComponent implements OnInit {
  title = input('');
  chartType = input.required<ChartType>();
  chartOptions = computed<ChartConfiguration['options']>(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
        },
      },
      title: {
        display: true,
        text: this.title(),
        font: {
          size: 20,
        },
      },
      datalabels: {
        align: 'center',
        backgroundColor: '#2B2D42',
        color: 'white',
        font: {
          size: 14,
        },
        formatter: function (value: number, context) {
          const total: number = context.chart.data.datasets[0].data.reduce(
            (prev, cure: any) => (prev += cure),
            0
          ) as number;
          return `${((value * 100) / total).toFixed(2)} %`;
        },
      },
    },
  }));

  chartData = input.required<GeneriChartData>();

  chartPlugins = [ChartDataLabels];

  ngOnInit(): void {}
}
