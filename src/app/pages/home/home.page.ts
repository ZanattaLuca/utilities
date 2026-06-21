import { Component, inject } from '@angular/core';
import { DashboardComponent } from '../../components/dashboard/dashboard';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-home-page',
  imports: [DashboardComponent],
  template: '<app-dashboard [entries]="config().spese" />',
})
export class HomePageComponent {
  protected readonly config = inject(ConfigService).config;
}
