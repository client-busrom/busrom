import * as migration_20251213_123245 from './20251213_123245';

export const migrations = [
  {
    up: migration_20251213_123245.up,
    down: migration_20251213_123245.down,
    name: '20251213_123245'
  },
];
