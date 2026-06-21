import { Component } from '@angular/core';
import { EntriesComponent } from '../../components/entries/entries';

@Component({
  selector: 'app-bills-page',
  imports: [EntriesComponent],
  template: '<app-entries />',
})
export class BillsPageComponent {}
