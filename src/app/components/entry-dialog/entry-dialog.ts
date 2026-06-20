import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UtilityType, SpesaEntry, UTILITY_LABELS } from '../../models/config.model';

export interface EntryDialogData {
  type: UtilityType;
  entry?: SpesaEntry;
}

@Component({
  selector: 'app-entry-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './entry-dialog.html',
  styleUrl: './entry-dialog.scss',
})
export class EntryDialogComponent {
  protected readonly form: FormGroup;
  protected readonly isEdit: boolean;
  protected readonly type: UtilityType;
  protected readonly label: string;

  protected readonly currentYear = new Date().getFullYear();
  protected readonly years: number[] = [];
  protected readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  protected readonly months = this.monthNames.map((name, i) => ({ value: i + 1, label: name }));
  protected readonly quarters = [1, 2, 3, 4];

  constructor(
    fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<EntryDialogComponent, SpesaEntry>,
    @Inject(MAT_DIALOG_DATA) public readonly data: EntryDialogData,
  ) {
    this.type = data.type;
    this.label = UTILITY_LABELS[data.type];
    this.isEdit = !!data.entry;

    for (let y = this.currentYear - 3; y <= this.currentYear + 1; y++) {
      this.years.push(y);
    }

    const entry = data.entry;

    this.form = fb.group({
      anno: [this.currentYear, Validators.required],
      subPeriodo: [entry ? null : (this.type === 'acqua' ? 1 : 1)],
      importo: [entry?.importo ?? '', [Validators.required, Validators.min(0.01)]],
      pagato: [entry?.pagato ?? false],
    });

    if (entry) {
      this.parsePeriodo(entry.periodo);
    }
  }

  private parsePeriodo(periodo: string): void {
    if (this.type === 'rifiuti') {
      this.form.patchValue({ anno: parseInt(periodo, 10) });
    } else if (this.type === 'acqua') {
      const m = periodo.match(/^(\d{4})-Q([1-4])$/);
      if (m) {
        this.form.patchValue({ anno: parseInt(m[1], 10), subPeriodo: parseInt(m[2], 10) });
      }
    } else {
      const m = periodo.match(/^(\d{4})-(\d{2})$/);
      if (m) {
        this.form.patchValue({ anno: parseInt(m[1], 10), subPeriodo: parseInt(m[2], 10) });
      }
    }
  }

  protected get showSubPeriodo(): boolean {
    return this.type !== 'rifiuti';
  }

  protected get subPeriodoLabel(): string {
    return this.type === 'acqua' ? 'Quarter' : 'Month';
  }

  protected get subPeriodoOptions(): { value: number; label: string }[] {
    return this.type === 'acqua'
      ? this.quarters.map((q) => ({ value: q, label: `Q${q}` }))
      : this.months;
  }

  protected get periodo(): string {
    const anno = this.form.get('anno')?.value;
    if (this.type === 'rifiuti') {
      return `${anno}`;
    }
    const sub = this.form.get('subPeriodo')?.value;
    if (this.type === 'acqua') {
      return `${anno}-Q${sub}`;
    }
    return `${anno}-${String(sub).padStart(2, '0')}`;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const entry: SpesaEntry = {
      periodo: this.periodo,
      importo: this.form.get('importo')?.value,
      pagato: this.form.get('pagato')?.value,
    };
    this.dialogRef.close(entry);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
