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

export const UTILITY_ICONS: Record<UtilityType, string> = {
  luce: 'bolt',
  gas: 'local_fire_department',
  acqua: 'water_drop',
  rifiuti: 'delete',
};
