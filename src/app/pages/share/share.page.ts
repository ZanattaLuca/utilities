import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardComponent } from '../../components/dashboard/dashboard';
import { ConfigService } from '../../services/config.service';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-share-page',
  imports: [DashboardComponent, MatCardModule, MatIconModule],
  template: `
    <mat-card appearance="outlined" class="share-banner">
      <mat-icon>visibility</mat-icon>
      <span>Shared view — read-only</span>
    </mat-card>
    <app-dashboard [entries]="config().spese" />
  `,
  styles: [
    `
      .share-banner {
        margin: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
      .share-banner mat-icon {
        vertical-align: middle;
      }
    `,
  ],
})
export class SharePageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly configService = inject(ConfigService);
  private readonly shareService = inject(ShareService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly config = this.configService.config;

  ngOnInit(): void {
    const data = this.route.snapshot.queryParamMap.get('d');
    if (!data) {
      this.snackBar.open('Invalid share link', 'Dismiss', { duration: 4000 });
      this.router.navigate(['/']);
      return;
    }
    try {
      const decoded = this.shareService.decode(data);
      this.configService.loadShared(decoded);
    } catch {
      this.snackBar.open('Invalid share link', 'Dismiss', { duration: 4000 });
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.configService.exitShared();
  }
}
