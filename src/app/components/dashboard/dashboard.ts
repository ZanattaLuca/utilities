import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxEchartsDirective } from 'ngx-echarts';
import { UtilityType, UTILITY_TYPES, UTILITY_LABELS, UTILITY_ICONS, UTILITY_COLORS, SpesaEntry, TimePeriod, parsePeriodo } from '../../models/config.model';
import { ConfigService } from '../../services/config.service';

type ChartKey = 'donut' | 'bar' | 'line' | 'cards';

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
  { value: 'bar', label: 'Bar' },
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
  private readonly configService = inject(ConfigService);
  protected readonly config = this.configService;

  readonly entries = input.required<Record<UtilityType, SpesaEntry[]>>();

  protected readonly utilityTypes = UTILITY_TYPES;
  protected readonly labels = UTILITY_LABELS;
  protected readonly icons = UTILITY_ICONS;
  protected readonly periodOptions = PERIOD_OPTIONS;
  protected readonly chartOptions = CHART_OPTIONS;

  protected readonly selectedPeriod = computed<TimePeriod>(() => this.config.filters().period);
  protected readonly selectedUtilities = computed<Set<UtilityType>>(() => new Set(this.config.filters().utilities));
  protected readonly showTotal = computed(() => this.config.filters().showTotal);
  protected readonly showDonut = computed(() => this.config.filters().showDonut);
  protected readonly showBar = computed(() => this.config.filters().showBar);
  protected readonly showLine = computed(() => this.config.filters().showLine);
  protected readonly showCards = computed(() => this.config.filters().showCards);

  protected readonly selectedUtilityValues = computed<(UtilityType | 'total')[]>(() => {
    const types = UTILITY_TYPES.filter((t) => this.selectedUtilities().has(t));
    return this.showTotal() ? [...types, 'total'] : types;
  });

  protected readonly selectedChartValues = computed<ChartKey[]>(() => {
    const values: ChartKey[] = [];
    if (this.showDonut()) values.push('donut');
    if (this.showBar()) values.push('bar');
    if (this.showLine()) values.push('line');
    if (this.showCards()) values.push('cards');
    return values;
  });

  protected onUtilityChange(values: (UtilityType | 'total')[]): void {
    const types = values.filter((v): v is UtilityType => v !== 'total');
    this.config.setUtilities(types);
    this.config.setShowTotal(values.includes('total'));
  }

  protected onDisplayChange(values: ChartKey[]): void {
    const set = new Set(values);
    this.config.setDisplay({
      showDonut: set.has('donut'),
      showBar: set.has('bar'),
      showLine: set.has('line'),
      showCards: set.has('cards'),
    });
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

  protected readonly barOption = computed(() => {
    const visibleTypes = UTILITY_TYPES.filter((t) => this.selectedUtilities().has(t));
    const showTotal = this.showTotal();

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

    const totals = periods.map((p) => {
      let sum = 0;
      for (const type of visibleTypes) {
        sum += grouped[type].get(p) || 0;
      }
      return Number(sum.toFixed(2));
    });

    const series: any[] = visibleTypes.map((type) => ({
      type: 'bar' as const,
      stack: 'total',
      data: periods.map((p) => Number((grouped[type].get(p) || 0).toFixed(2))),
      name: UTILITY_LABELS[type],
      itemStyle: { color: UTILITY_COLORS[type] },
      label: { show: false },
    }));

    if (showTotal) {
      series.push({
        type: 'bar' as const,
        stack: 'total',
        data: periods.map(() => 0),
        name: 'Total',
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          formatter: (p: any) => `€${totals[p.dataIndex].toFixed(2)}`,
        },
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
          let total = 0;
          for (const p of params) {
            if (p.seriesName === 'Total') continue;
            result += `${p.marker} ${p.seriesName}: €${p.data.toFixed(2)}<br/>`;
            total += p.data;
          }
          if (showTotal) {
            result += `Total: €${total.toFixed(2)}<br/>`;
          }
          return result;
        },
      },
      grid: { left: 16, right: 16, top: 24, bottom: 4 },
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
