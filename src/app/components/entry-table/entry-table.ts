import { Component, input, output, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SpesaEntry, parsePeriodo } from '../../models/config.model';
import { PeriodPipe } from '../../shared/period.pipe';

interface SortedEntry extends SpesaEntry {
  _origIndex: number;
}

@Component({
  selector: 'app-entry-table',
  imports: [MatTableModule, MatButtonModule, MatIconModule, CurrencyPipe, PeriodPipe],
  templateUrl: './entry-table.html',
  styleUrl: './entry-table.scss',
})
export class EntryTableComponent {
  readonly entries = input.required<SpesaEntry[]>();

  readonly edit = output<{ index: number; entry: SpesaEntry }>();
  readonly remove = output<number>();
  protected readonly displayedColumns = ['periodo', 'importo', 'azioni'];

  protected readonly sorted = computed<SortedEntry[]>(() =>
    this.entries()
      .map((e, i) => ({ ...e, _origIndex: i }))
      .sort((a, b) => parsePeriodo(a.periodo) - parsePeriodo(b.periodo)),
  );

}
