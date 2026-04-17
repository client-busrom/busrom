import * as migration_20251213_123245 from './20251213_123245';
import * as migration_20260315_143000_add_is_main_seo from './20260315_143000_add_is_main_seo';
import * as migration_20260417_133000_sync_checkpoint from './20260417_133000_sync_checkpoint';

import * as migration_20260417_152000_add_blog_templates from './20260417_152000_add_blog_templates';

export const migrations = [
  {
    up: migration_20251213_123245.up,
    down: migration_20251213_123245.down,
    name: '20251213_123245',
  },
  {
    up: migration_20260315_143000_add_is_main_seo.up,
    down: migration_20260315_143000_add_is_main_seo.down,
    name: '20260315_143000_add_is_main_seo',
  },
  {
    up: migration_20260417_133000_sync_checkpoint.up,
    down: migration_20260417_133000_sync_checkpoint.down,
    name: '20260417_133000_sync_checkpoint',
  },
  {
    up: migration_20260417_152000_add_blog_templates.up,
    down: migration_20260417_152000_add_blog_templates.down,
    name: '20260417_152000_add_blog_templates',
  },
];
