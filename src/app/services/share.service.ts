import { Injectable } from '@angular/core';
import * as LZString from 'lz-string';
import { Config, createDefaultFilters } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class ShareService {
  encode(config: Config): string {
    return LZString.compressToEncodedURIComponent(JSON.stringify(config));
  }

  decode(data: string): Config {
    let parsed: Config;
    try {
      const json = LZString.decompressFromEncodedURIComponent(data);
      parsed = JSON.parse(json);
    } catch {
      throw new Error('Invalid share data');
    }
    if (!parsed || !parsed.version || !parsed.spese) {
      throw new Error('Invalid share data');
    }
    parsed.filters = { ...createDefaultFilters(), ...parsed.filters };
    return parsed;
  }
}
