import * as migration_20251213_123245 from './20251213_123245';
import * as migration_20260315_143000 from './20260315_143000_add_is_main_seo';

export const migrations = [
  {
    up: migration_20251213_123245.up,
    down: migration_20251213_123245.down,
    name: '20251213_123245'
  },
  {
    up: migration_20260315_143000.up,
    down: migration_20260315_143000.down,
    name: '20260315_143000_add_is_main_seo'
  },
];
