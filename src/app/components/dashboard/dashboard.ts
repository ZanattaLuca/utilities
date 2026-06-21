import { Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxEchartsDirective } from 'ngx-echarts';
import { UtilityType, UTILITY_TYPES, UTILITY_LABELS, UTILITY_ICONS, UTILITY_COLORS, SpesaEntry, parsePeriodo } from '../../models/config.model';

type TimePeriod = 'this-year' | '1y' | '3y' | '5y' | 'all';
type ChartKey = 'donut' | 'line' | 'cards';

interface PeriodOption {
  value: TimePeriod;
  label: string;
}

interface ChartOption {
  value: ChartKey;
  label: string;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 'this-year', label: 'This Year' },
  { value: '1y', label: '1 Year' },
  { value: '3y', label: '3 Years' },
  { value: '5y', label: '5 Years' },
  { value: 'all', label: 'All Time' },
];

const CHART_OPTIONS: ChartOption[] = [
  { value: 'donut', label: 'Donut' },
  { value: 'line', label: 'Line' },
  { value: 'cards', label: 'Cards' },
];

@Component({
  selector: 'app-dashboard',
  imports: [MatButtonToggleModule, MatCardModule, MatIconModule, MatTabsModule, NgxEchartsDirective, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  readonly entries = input.required<Record<UtilityType, SpesaEntry[]>>();

  protected readonly utilityTypes = UTILITY_TYPES;
  protected readonly labels = UTILITY_LABELS;
  protected readonly icons = UTILITY_ICONS;
  protected readonly periodOptions = PERIOD_OPTIONS;
  protected readonly chartOptions = CHART_OPTIONS;
  protected readonly selectedPeriod = signal<TimePeriod>('all');
  protected readonly selectedUtilities = signal<Set<UtilityType>>(new Set(UTILITY_TYPES));
  protected readonly showTotal = signal(true);
  protected readonly showDonut = signal(true);
  protected readonly showLine = signal(true);
  protected readonly showCards = signal(true);

  protected readonly selectedUtilityValues = computed<(UtilityType | 'total')[]>(() => {
    const types = UTILITY_TYPES.filter((t) => this.selectedUtilities().has(t));
    return this.showTotal() ? [...types, 'total'] : types;
  });

  protected readonly selectedChartValues = computed<ChartKey[]>(() => {
    const values: ChartKey[] = [];
    if (this.showDonut()) values.push('donut');
    if (this.showLine()) values.push('line');
    if (this.showCards()) values.push('cards');
    return values;
  });

  protected onUtilityChange(values: (UtilityType | 'total')[]): void {
    const types = new Set(values.filter((v): v is UtilityType => v !== 'total'));
    this.selectedUtilities.set(types);
    this.showTotal.set(values.includes('total'));
  }

  protected onDisplayChange(values: ChartKey[]): void {
    const set = new Set(values);
    this.showDonut.set(set.has('donut'));
    this.showLine.set(set.has('line'));
    this.showCards.set(set.has('cards'));
  }

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

  protected count(type: UtilityType): number {
    return this.filtered(type).length;
  }

  protected readonly donutOption = computed(() => ({
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: '#2a2a2a',
      borderColor: '#444',
      textStyle: { color: '#fff' },
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}: €${p.value.toFixed(2)} (${p.percent}%)`,
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['45%', '75%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#1e1e1e', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' },
        },
        data: UTILITY_TYPES
          .filter((t) => this.selectedUtilities().has(t))
          .map((t) => ({
            name: UTILITY_LABELS[t],
            value: Number(this.total(t).toFixed(2)),
            itemStyle: { color: UTILITY_COLORS[t] },
          })),
      },
    ],
  }));

  protected readonly lineOption = computed(() => {
    const visibleTypes = UTILITY_TYPES.filter((t) => this.selectedUtilities().has(t));

    const grouped = Object.fromEntries(
      visibleTypes.map((t) => [t, new Map<string, number>()]),
    ) as Record<UtilityType, Map<string, number>>;

    const periodSet = new Set<string>();

    for (const type of visibleTypes) {
      for (const e of this.filtered(type)) {
        periodSet.add(e.periodo);
        grouped[type].set(e.periodo, (grouped[type].get(e.periodo) || 0) + e.importo);
      }
    }

    const periods = [...periodSet].sort((a, b) => parsePeriodo(a) - parsePeriodo(b));

    const series: any[] = [];

    for (const type of visibleTypes) {
      let cum = 0;
      const data: number[] = [];
      for (const p of periods) {
        cum += grouped[type].get(p) || 0;
        data.push(Number(cum.toFixed(2)));
      }
      series.push({
        type: 'line' as const,
        data,
        name: UTILITY_LABELS[type],
        smooth: true,
        lineStyle: { color: UTILITY_COLORS[type], width: 2 },
        itemStyle: { color: UTILITY_COLORS[type] },
      });
    }

    if (this.showTotal()) {
      let totalRunning = 0;
      const totalData: number[] = [];
      for (const p of periods) {
        let periodSum = 0;
        for (const type of visibleTypes) {
          periodSum += grouped[type].get(p) || 0;
        }
        totalRunning += periodSum;
        totalData.push(Number(totalRunning.toFixed(2)));
      }
      series.push({
        type: 'line' as const,
        data: totalData,
        name: 'Total',
        smooth: true,
        lineStyle: { color: '#33ff00ff', width: 3 },
        itemStyle: { color: '#33ff00ff' },
      });
    }

    return {
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
        textStyle: { color: '#fff' },
        formatter: (params: any[]) => {
          let result = `${params[0].axisValue}<br/>`;
          for (const p of params) {
            result += `${p.marker} ${p.seriesName}: €${p.data.toFixed(2)}<br/>`;
          }
          return result;
        },
      },
      grid: { left: 16, right: 16, top: 8, bottom: 4 },
      xAxis: {
        type: 'category' as const,
        data: periods,
        axisLabel: { rotate: 45, fontSize: 10, color: '#e0e0e0' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: { fontSize: 11, color: '#e0e0e0' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        splitLine: { lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.12)' } },
      },
      series,
    };
  });
}

function monthsToPeriod(totalMonths: number): number {
  const y = Math.floor((totalMonths - 1) / 12);
  const m = ((totalMonths - 1) % 12) + 1;
  return y * 100 + m;
}
