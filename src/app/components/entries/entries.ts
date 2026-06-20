import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../../services/config.service';
import { UtilityType, UTILITY_TYPES, UTILITY_LABELS, SpesaEntry } from '../../models/config.model';
import { EntryTableComponent } from '../entry-table/entry-table';
import { EntryDialogComponent } from '../entry-dialog/entry-dialog';

@Component({
  selector: 'app-entries',
  imports: [MatTabsModule, MatButtonModule, MatIconModule, EntryTableComponent],
  templateUrl: './entries.html',
  styleUrl: './entries.scss',
})
export class EntriesComponent {
  private readonly configService = inject(ConfigService);
  private readonly dialog = inject(MatDialog);

  protected readonly utilityTypes = UTILITY_TYPES;
  protected readonly labels = UTILITY_LABELS;
  protected readonly config = this.configService.config;
  protected selectedIndex = 0;

  protected openAddDialog(type: UtilityType): void {
    const dialogRef = this.dialog.open(EntryDialogComponent, {
      data: { type },
      width: '400px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((result: { entry: SpesaEntry; type: UtilityType } | undefined) => {
      if (result) {
        this.configService.addEntry(result.type, result.entry);
      }
    });
  }

  protected openEditDialog(type: UtilityType, index: number, entry: SpesaEntry): void {
    const dialogRef = this.dialog.open(EntryDialogComponent, {
      data: { type, entry },
      width: '400px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((result: { entry: SpesaEntry; type: UtilityType } | undefined) => {
      if (result) {
        this.configService.updateEntry(result.type, index, result.entry);
      }
    });
  }

  protected deleteEntry(type: UtilityType, index: number): void {
    this.configService.deleteEntry(type, index);
  }

  protected togglePaid(type: UtilityType, index: number, entry: SpesaEntry): void {
    this.configService.updateEntry(type, index, entry);
  }
}
