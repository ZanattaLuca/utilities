import { Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UtilityType, UTILITY_TYPES, UTILITY_LABELS, UTILITY_ICONS, SpesaEntry, parsePeriodo } from '../../models/config.model';

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
  imports: [MatButtonToggleModule, MatCardModule, MatIconModule, CurrencyPipe],
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
}

function monthsToPeriod(totalMonths: number): number {
  const y = Math.floor((totalMonths - 1) / 12);
  const m = ((totalMonths - 1) % 12) + 1;
  return y * 100 + m;
}
