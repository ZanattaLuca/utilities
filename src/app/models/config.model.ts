export interface SpesaEntry {
  periodo: string;
  importo: number;
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
  luce: 'Electricity',
  gas: 'Gas',
  acqua: 'Water',
  rifiuti: 'Waste',
};

export function parsePeriodo(periodo: string): number {
  const m = periodo.match(/^(\d{4})-(\d{2})$/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 100 + parseInt(m[2], 10);
}

export const UTILITY_ICONS: Record<UtilityType, string> = {
  luce: 'bolt',
  gas: 'local_fire_department',
  acqua: 'water_drop',
  rifiuti: 'delete',
};

export const UTILITY_COLORS: Record<UtilityType, string> = {
  luce: '#ffc14d',
  gas: '#ff5252',
  acqua: '#29d4f5',
  rifiuti: '#b388ff',
};
