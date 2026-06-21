export interface SpesaEntry {
  periodo: string;
  importo: number;
}

export type UtilityType = 'luce' | 'gas' | 'acqua' | 'rifiuti';

export type TimePeriod = 'this-year' | '1y' | '3y' | '5y' | 'all';

export interface FilterConfig {
  period: TimePeriod;
  utilities: UtilityType[];
  showTotal: boolean;
  showDonut: boolean;
  showBar: boolean;
  showLine: boolean;
  showCards: boolean;
}

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
  filters: FilterConfig;
}

export function createDefaultFilters(): FilterConfig {
  return {
    period: 'all',
    utilities: [...UTILITY_TYPES],
    showTotal: true,
    showDonut: true,
    showBar: true,
    showLine: true,
    showCards: true,
  };
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
