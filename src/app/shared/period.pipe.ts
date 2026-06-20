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
    const m = value.match(/^(\d{4})(?:-Q([1-4]))?(?:-(\d{2}))?$/);
    if (!m) return value;

    const year = m[1];
    if (m[2]) return `Q${m[2]} ${year}`;
    if (m[3]) {
      const month = parseInt(m[3], 10);
      return `${MONTHS[month - 1]} ${year}`;
    }
    return year;
  }
}
