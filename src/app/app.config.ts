import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import { HomePageComponent } from './pages/home/home.page';
import { BillsPageComponent } from './pages/bills/bills.page';
import { ImportExportPageComponent } from './pages/import-export/import-export.page';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'bills', component: BillsPageComponent },
  { path: 'import-export', component: ImportExportPageComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideEchartsCore({ echarts })],
};
