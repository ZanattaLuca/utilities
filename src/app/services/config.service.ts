import { Injectable, computed, signal } from '@angular/core';
import { Config, FilterConfig, SpesaEntry, UtilityType, TimePeriod, createDefaultFilters } from '../models/config.model';

const STORAGE_KEY = 'utilities-config';

function createEmptyConfig(): Config {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    spese: {
      luce: [],
      gas: [],
      acqua: [],
      rifiuti: [],
    },
    filters: createDefaultFilters(),
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly state = signal<Config>(this.load());

  readonly config = this.state.asReadonly();
  readonly filters = computed(() => this.state().filters);

  private updateFilters(patch: Partial<FilterConfig>): void {
    this.state.update((config) => ({
      ...config,
      filters: { ...config.filters, ...patch },
    }));
    this.persist();
  }

  setPeriod(period: TimePeriod): void {
    this.updateFilters({ period });
  }

  setUtilities(utilities: UtilityType[]): void {
    this.updateFilters({ utilities });
  }

  setShowTotal(value: boolean): void {
    this.updateFilters({ showTotal: value });
  }

  setDisplay(patch: Partial<Pick<FilterConfig, 'showDonut' | 'showBar' | 'showLine' | 'showCards'>>): void {
    this.updateFilters(patch);
  }

  private load(): Config {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version && parsed.spese) {
          parsed.filters = { ...createDefaultFilters(), ...parsed.filters };
          return parsed;
        }
      }
    } catch {
      // corrupted data, start fresh
    }
    return createEmptyConfig();
  }

  private persist(): void {
    const config = this.state();
    config.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  getSpese(type: UtilityType): SpesaEntry[] {
    return this.state().spese[type];
  }

  addEntry(type: UtilityType, entry: SpesaEntry): void {
    this.state.update((config) => ({
      ...config,
      spese: {
        ...config.spese,
        [type]: [...config.spese[type], entry],
      },
    }));
    this.persist();
  }

  updateEntry(type: UtilityType, index: number, entry: SpesaEntry): void {
    this.state.update((config) => {
      const updated = [...config.spese[type]];
      updated[index] = entry;
      return {
        ...config,
        spese: { ...config.spese, [type]: updated },
      };
    });
    this.persist();
  }

  deleteEntry(type: UtilityType, index: number): void {
    this.state.update((config) => ({
      ...config,
      spese: {
        ...config.spese,
        [type]: config.spese[type].filter((_, i) => i !== index),
      },
    }));
    this.persist();
  }
}
