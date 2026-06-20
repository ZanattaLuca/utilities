import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UtilityType, UTILITY_TYPES, UTILITY_LABELS, UTILITY_ICONS, SpesaEntry } from '../../models/config.model';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  readonly entries = input.required<Record<UtilityType, SpesaEntry[]>>();

  protected readonly utilityTypes = UTILITY_TYPES;
  protected readonly labels = UTILITY_LABELS;
  protected readonly icons = UTILITY_ICONS;

  protected total(type: UtilityType): number {
    return this.entries()[type].reduce((sum, e) => sum + e.importo, 0);
  }

  protected unpaid(type: UtilityType): number {
    return this.entries()[type].filter((e) => !e.pagato).length;
  }

  protected count(type: UtilityType): number {
    return this.entries()[type].length;
  }
}
