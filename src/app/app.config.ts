import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import { HomePageComponent } from './pages/home/home.page';
import { BillsPageComponent } from './pages/bills/bills.page';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'bills', component: BillsPageComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideEchartsCore({ echarts })],
};
