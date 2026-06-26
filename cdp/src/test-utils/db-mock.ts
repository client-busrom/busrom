import { vi } from 'vitest'

/**
 * Creates a minimal Drizzle-style query builder mock.
 *
 * Any chain of `.select().from().where().orderBy().limit()` returns the
 * provided rows when awaited. `.where()` can also be awaited directly, so
 * both `db.select().from().where()` and `db.select().from().where().orderBy().limit()`
 * resolve to `rows`.
 */
export function createMockDb(rows: any[] = []) {
  function createProxy(): any {
    return new Proxy(() => rows, {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (value: any) => any) => Promise.resolve(resolve(rows))
        }
        return createProxy()
      },
      apply(_target, _thisArg, _args) {
        return createProxy()
      },
    })
  }

  return {
    select: vi.fn(createProxy),
  }
}
