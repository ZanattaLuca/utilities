import { Injectable, signal } from '@angular/core';
import { Config, SpesaEntry, UtilityType } from '../models/config.model';

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
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly state = signal<Config>(this.load());

  readonly config = this.state.asReadonly();

  private load(): Config {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version && parsed.spese) {
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
