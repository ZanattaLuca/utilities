import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DashboardComponent } from './components/dashboard/dashboard';
import { EntriesComponent } from './components/entries/entries';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  imports: [MatToolbarModule, DashboardComponent, EntriesComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly config = inject(ConfigService).config;
}
