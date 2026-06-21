import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../services/config.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';
import { ShareDialogComponent } from '../../components/share-dialog/share-dialog';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-import-export-page',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card appearance="outlined" class="io-card">
      <mat-card-header>
        <mat-card-title>Import / Export</mat-card-title>
        <mat-card-subtitle>Download or restore your configuration as a JSON file</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p class="io-description">
          Export saves your bills and filters to a JSON file. Import replaces all current data with the contents of a previously exported file.
        </p>
        <input type="file" accept=".json,application/json" hidden #fileInput (change)="onFileSelected($event)" />
      </mat-card-content>
      <mat-card-actions align="start">
        <button mat-raised-button color="primary" (click)="export()">
          <mat-icon>download</mat-icon>
          Export
        </button>
        <button mat-raised-button (click)="fileInput.click()">
          <mat-icon>upload</mat-icon>
          Import
        </button>
      </mat-card-actions>
    </mat-card>

    <mat-card appearance="outlined" class="io-card">
      <mat-card-header>
        <mat-card-title>Share</mat-card-title>
        <mat-card-subtitle>Generate a read-only link to send via WhatsApp</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p class="io-description">
          Generates a link containing your bills compressed into the URL. Anyone who opens it can view your dashboard in read-only mode — filters stay interactive, but no data can be modified.
        </p>
      </mat-card-content>
      <mat-card-actions align="start">
        <button mat-raised-button color="primary" (click)="share()">
          <mat-icon>share</mat-icon>
          Share
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .io-card {
        margin: 16px;
      }
      .io-description {
        color: var(--mat-sys-on-surface-variant, rgba(255, 255, 255, 0.7));
        line-height: 1.5;
        margin: 12px 0 0;
      }
      mat-card-actions button {
        margin: 4px 8px 4px 0;
      }
    `,
  ],
})
export class ImportExportPageComponent {
  private readonly configService = inject(ConfigService);
  private readonly shareService = inject(ShareService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected export(): void {
    const json = this.configService.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilities-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.snackBar.open('Configuration exported', 'Dismiss', { duration: 3000 });
  }

  protected share(): void {
    const encoded = this.shareService.encode(this.configService.config());
    const base = `${location.origin}${location.pathname}`;
    const link = `${base}#/share?d=${encoded}`;
    this.dialog.open(ShareDialogComponent, { data: link });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.confirmImport(result);
    };
    reader.onerror = () => {
      this.snackBar.open('Failed to read file', 'Dismiss', { duration: 4000 });
      this.resetInput();
    };
    reader.readAsText(file);
  }

  private confirmImport(json: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Import configuration',
        message: 'This will replace all current data with the contents of the selected file. Continue?',
        confirmLabel: 'Import',
      },
    });
    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed) {
        this.runImport(json);
      }
      this.resetInput();
    });
  }

  private runImport(json: string): void {
    try {
      this.configService.importConfig(json);
      this.snackBar.open('Configuration imported', 'Dismiss', { duration: 3000 });
    } catch (e) {
      this.snackBar.open((e as Error).message || 'Import failed', 'Dismiss', { duration: 5000 });
    }
  }

  private resetInput(): void {
    const input = this.fileInput().nativeElement;
    input.value = '';
  }
}
