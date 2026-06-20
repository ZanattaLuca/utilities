export interface SpesaEntry {
  periodo: string;
  importo: number;
  pagato: boolean;
}

export type UtilityType = 'luce' | 'gas' | 'acqua' | 'rifiuti';

export interface Spese {
  luce: SpesaEntry[];
  gas: SpesaEntry[];
  acqua: SpesaEntry[];
  rifiuti: SpesaEntry[];
}

export interface Config {
  version: number;
  lastUpdated: string;
  spese: Spese;
}

export const UTILITY_TYPES: UtilityType[] = ['luce', 'gas', 'acqua', 'rifiuti'];

export const UTILITY_LABELS: Record<UtilityType, string> = {
  luce: 'Luce',
  gas: 'Gas',
  acqua: 'Acqua',
  rifiuti: 'Rifiuti',
};

export function parsePeriodo(periodo: string): number {
  const m = periodo.match(/^(\d{4})(?:-Q([1-4]))?(?:-(\d{2}))?$/);
  if (!m) return 0;
  const anno = parseInt(m[1], 10);
  if (m[2]) return anno * 100 + [1, 4, 7, 10][parseInt(m[2], 10) - 1];
  if (m[3]) return anno * 100 + parseInt(m[3], 10);
  return anno * 100 + 1;
}

export const UTILITY_ICONS: Record<UtilityType, string> = {
  luce: 'bolt',
  gas: 'local_fire_department',
  acqua: 'water_drop',
  rifiuti: 'delete',
};
