import { Pipe, PipeTransform } from '@angular/core';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Pipe({
  name: 'period',
  standalone: true,
})
export class PeriodPipe implements PipeTransform {
  transform(value: string): string {
    const m = value.match(/^(\d{4})-(\d{2})$/);
    if (!m) return value;
    const month = parseInt(m[2], 10);
    return `${MONTHS[month - 1]} ${m[1]}`;
  }
}
