import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-share-dialog',
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Share your bills</h2>
    <mat-dialog-content>
      <p class="share-description">
        Anyone with this link can view your bills in read-only mode. Filters stay interactive, but no data can be modified.
      </p>
      @if (warning) {
        <p class="share-warning">
          <mat-icon>warning</mat-icon>
          This link is very long and may be truncated by some messaging apps.
        </p>
      }
      <mat-form-field appearance="outline" class="link-field">
        <mat-label>Share link</mat-label>
        <input matInput readonly value="{{ link }}" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
      <button mat-button (click)="copy()">
        <mat-icon>content_copy</mat-icon>
        Copy link
      </button>
      <button mat-raised-button color="primary" (click)="openWhatsApp()">
        <mat-icon>share</mat-icon>
        Share on WhatsApp
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .share-description {
        color: var(--mat-sys-on-surface-variant, rgba(255, 255, 255, 0.7));
        line-height: 1.5;
        margin: 0 0 12px;
      }
      .share-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--mat-sys-error, #ff5252);
        font-size: 0.85rem;
        margin: 0 0 12px;
      }
      .share-warning mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .link-field {
        width: 100%;
      }
      .link-field input {
        font-size: 0.8rem;
      }
    `,
  ],
})
export class ShareDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ShareDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly link = inject<string>(MAT_DIALOG_DATA);
  protected readonly warning = this.link.length > 6000;

  protected close(): void {
    this.dialogRef.close();
  }

  protected copy(): void {
    navigator.clipboard
      .writeText(this.link)
      .then(() => this.snackBar.open('Link copied to clipboard', 'Dismiss', { duration: 3000 }))
      .catch(() => this.snackBar.open('Failed to copy link', 'Dismiss', { duration: 4000 }));
  }

  protected openWhatsApp(): void {
    window.open(`https://wa.me/?text=${encodeURIComponent(this.link)}`, '_blank');
  }
}
