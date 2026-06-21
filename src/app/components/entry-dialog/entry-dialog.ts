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
import { UtilityType, SpesaEntry, UTILITY_TYPES, UTILITY_LABELS } from '../../models/config.model';

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
  ],
  templateUrl: './entry-dialog.html',
  styleUrl: './entry-dialog.scss',
})
export class EntryDialogComponent {
  protected readonly form: FormGroup;
  protected readonly isEdit: boolean;

  protected readonly currentYear = new Date().getFullYear();
  protected readonly years: number[] = [];
  protected readonly utilityTypes = UTILITY_TYPES;
  protected readonly utilityLabels = UTILITY_LABELS;
  protected readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  protected readonly months = this.monthNames.map((name, i) => ({ value: i + 1, label: name }));

  constructor(
    fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<EntryDialogComponent, { entry: SpesaEntry; type: UtilityType }>,
    @Inject(MAT_DIALOG_DATA) public readonly data: EntryDialogData,
  ) {
    this.isEdit = !!data.entry;

    for (let y = this.currentYear - 3; y <= this.currentYear + 1; y++) {
      this.years.push(y);
    }

    const entry = data.entry;

    this.form = fb.group({
      type: [{ value: data.type, disabled: this.isEdit }, Validators.required],
      anno: [this.currentYear, Validators.required],
      subPeriodo: [entry ? null : 1],
      importo: [entry?.importo ?? '', [Validators.required, Validators.min(0.01)]],

    });

    if (entry) {
      this.parsePeriodo(entry.periodo);
    }
  }

  private parsePeriodo(periodo: string): void {
    const m = periodo.match(/^(\d{4})-(\d{2})$/);
    if (m) {
      this.form.patchValue({ anno: parseInt(m[1], 10), subPeriodo: parseInt(m[2], 10) });
    }
  }

  protected get selectedType(): UtilityType {
    return this.form.get('type')?.value;
  }

  protected get label(): string {
    return UTILITY_LABELS[this.selectedType];
  }

  protected get periodo(): string {
    const anno = this.form.get('anno')?.value;
    const sub = this.form.get('subPeriodo')?.value;
    return `${anno}-${String(sub).padStart(2, '0')}`;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const entry: SpesaEntry = {
      periodo: this.periodo,
      importo: this.form.get('importo')?.value,

    };
    this.dialogRef.close({ entry, type: this.selectedType });
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
