import { Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxEchartsDirective } from 'ngx-echarts';
import { UtilityType, UTILITY_TYPES, UTILITY_LABELS, UTILITY_ICONS, UTILITY_COLORS, SpesaEntry, parsePeriodo } from '../../models/config.model';

type TimePeriod = 'this-year' | '1y' | '3y' | '5y' | 'all';

interface PeriodOption {
  value: TimePeriod;
  label: string;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 'this-year', label: 'This Year' },
  { value: '1y', label: '1 Year' },
  { value: '3y', label: '3 Years' },
  { value: '5y', label: '5 Years' },
  { value: 'all', label: 'All Time' },
];

@Component({
  selector: 'app-dashboard',
  imports: [MatButtonToggleModule, MatCardModule, MatIconModule, NgxEchartsDirective, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  readonly entries = input.required<Record<UtilityType, SpesaEntry[]>>();

  protected readonly utilityTypes = UTILITY_TYPES;
  protected readonly labels = UTILITY_LABELS;
  protected readonly icons = UTILITY_ICONS;
  protected readonly periodOptions = PERIOD_OPTIONS;
  protected readonly selectedPeriod = signal<TimePeriod>('all');

  protected readonly cutoff = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const total = year * 12 + month;

    switch (this.selectedPeriod()) {
      case 'this-year':
        return year * 100 + 1;
      case '1y':
        return monthsToPeriod(total - 12);
      case '3y':
        return monthsToPeriod(total - 36);
      case '5y':
        return monthsToPeriod(total - 60);
      default:
        return 0;
    }
  });

  protected filtered(type: UtilityType): SpesaEntry[] {
    const c = this.cutoff();
    return this.entries()[type].filter((e) => parsePeriodo(e.periodo) >= c);
  }

  protected total(type: UtilityType): number {
    return this.filtered(type).reduce((sum, e) => sum + e.importo, 0);
  }

  protected unpaid(type: UtilityType): number {
    return this.filtered(type).filter((e) => !e.pagato).length;
  }

  protected count(type: UtilityType): number {
    return this.filtered(type).length;
  }

  protected readonly donutOption = computed(() => ({
    tooltip: {
      trigger: 'item' as const,
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}: €${p.value.toFixed(2)} (${p.percent}%)`,
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['45%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: UTILITY_TYPES.map((t) => ({
          name: UTILITY_LABELS[t],
          value: Number(this.total(t).toFixed(2)),
          itemStyle: { color: UTILITY_COLORS[t] },
        })),
      },
    ],
  }));

  protected readonly lineOption = computed(() => {
    const periodMap = new Map<string, number>();
    for (const type of UTILITY_TYPES) {
      for (const e of this.filtered(type)) {
        periodMap.set(e.periodo, (periodMap.get(e.periodo) || 0) + e.importo);
      }
    }

    const sorted = [...periodMap.entries()].sort(
      (a, b) => parsePeriodo(a[0]) - parsePeriodo(b[0]),
    );

    let cum = 0;
    const data = sorted.map(([, amount]) => {
      cum += amount;
      return Number(cum.toFixed(2));
    });

    return {
      tooltip: {
        trigger: 'axis' as const,
        formatter: (p: { data: number }[]) =>
          `€${p[0].data.toFixed(2)}`,
      },
      grid: { left: 16, right: 16, top: 8, bottom: 4 },
      xAxis: {
        type: 'category' as const,
        data: sorted.map(([p]) => p),
        axisLabel: { rotate: 45, fontSize: 10 },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [
        {
          type: 'line' as const,
          data,
          smooth: true,
          lineStyle: { color: '#3f51b5', width: 2 },
          itemStyle: { color: '#3f51b5' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(63,81,181,0.3)' },
                { offset: 1, color: 'rgba(63,81,181,0.02)' },
              ],
            } as any,
          },
        },
      ],
    };
  });
}

function monthsToPeriod(totalMonths: number): number {
  const y = Math.floor((totalMonths - 1) / 12);
  const m = ((totalMonths - 1) % 12) + 1;
  return y * 100 + m;
}
