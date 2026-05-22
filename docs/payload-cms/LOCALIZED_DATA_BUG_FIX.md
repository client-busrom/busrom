# Localized Data Bug Fix Documentation

## Problem Description

### Symptom
In Payload CMS, the English locale data for all homepage globals was displaying as JSON strings instead of plain text values.

**Example:**
- Expected: `"Premium Architectural Glass Hardware"`
- Actual: `"{\"en\":\"Premium Architectural Glass Hardware\",\"zh\":\"高端建筑玻璃五金\"}"`

### Affected Collections/Globals
- **Total affected fields:** 77 fields across 14 homepage globals
- **Affected globals:**
  - service-features (17 fields)
  - brand-advantages (9 fields)
  - oem-odm (6 fields)
  - featured-products (3 fields)
  - main-form (2 fields)
  - case-studies (2 fields)
  - quote-steps (9 fields)
  - why-choose-busrom (13 fields)
  - brand-value (10 fields)
  - simple-cta (3 fields)
  - product-series-carousel (1 field)
  - footer (10 fields)

## Root Cause

When using `payload.updateGlobal()` or `payload.create()`, if you pass an **object** with `{ en: "...", zh: "..." }` structure to a localized field, Payload CMS will:

1. JSON.stringify the entire object
2. Store it as a string: `"{\"en\":\"...\",\"zh\":\"...\"}"`

**Correct approach:**
```typescript
// ✅ CORRECT - Extract the locale value first
await payload.updateGlobal({
  slug: 'service-features',
  data: {
    title: 'Premium Architectural Glass Hardware', // Plain string
  },
  locale: 'en',
})
```

**Wrong approach:**
```typescript
// ❌ WRONG - Passing the entire object
await payload.updateGlobal({
  slug: 'service-features',
  data: {
    title: { en: 'Premium...', zh: '高端...' }, // This gets stringified!
  },
  locale: 'en',
})
```

## Solution

### The Fix Script

Created `/payload-cms/scripts/fix-all-homepage-globals.ts` which:

1. Scans all homepage globals
2. Detects fields with JSON string values
3. Parses the JSON strings
4. Extracts `en` and `zh` values
5. Updates both locales with correct plain text values

### How to Use

```bash
# Check for issues
npx tsx scripts/check-all-homepage-globals.ts

# Fix all issues
npx tsx scripts/fix-all-homepage-globals.ts

# Verify the fix
npx tsx scripts/check-all-homepage-globals.ts
```

### Fix Results

- **Total fixed:** 77 fields
- **Execution time:** ~20 seconds
- **Status:** ✅ All issues resolved

## Prevention

### Best Practices for Seed Scripts

When creating seed scripts with localized data:

```typescript
/**
 * ✅ CORRECT Helper Function
 */
async function updateLocalizedGlobal(
  payload: Payload,
  slug: string,
  data: any,
): Promise<void> {
  // Extract localized fields
  const localizedFields: Record<string, any> = {}
  const nonLocalizedFields: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'en' in value && 'zh' in value) {
      localizedFields[key] = value
    } else {
      nonLocalizedFields[key] = value
    }
  }

  // Update EN locale - extract ONLY the .en value
  const enData = { ...nonLocalizedFields }
  for (const [key, value] of Object.entries(localizedFields)) {
    enData[key] = value.en // ✅ Extract the .en value
  }

  await payload.updateGlobal({
    slug,
    data: enData, // ✅ Plain values only
    locale: 'en',
  })

  // Update ZH locale - extract ONLY the .zh value
  const zhData: Record<string, any> = {}
  for (const [key, value] of Object.entries(localizedFields)) {
    zhData[key] = value.zh // ✅ Extract the .zh value
  }

  await payload.updateGlobal({
    slug,
    data: zhData, // ✅ Plain values only
    locale: 'zh',
  })
}
```

### Validation Steps

After running any seed script:

1. Check a few sample fields in the admin UI
2. Verify that EN locale shows plain English text (not JSON strings)
3. Verify that ZH locale shows plain Chinese text
4. Run the check script: `npx tsx scripts/check-all-homepage-globals.ts`

## Files Created

- `/payload-cms/scripts/check-all-homepage-globals.ts` - Detection script
- `/payload-cms/scripts/fix-all-homepage-globals.ts` - Fix script
- `/payload-cms/scripts/debug-service-features.ts` - Debug helper
- `/payload-cms/scripts/test-update-global.ts` - Behavior test

## Related Files

- `/payload-cms/src/seed/seed-homepage-data.ts` - Has correct implementation
- `/payload-cms/scripts/import-from-keystone.ts` - Has correct implementation

## Lessons Learned

1. **Never pass locale objects directly to Payload API methods**
   - Always extract the specific locale value first

2. **Test seed scripts thoroughly**
   - Check the actual database values, not just the console output
   - Verify both locales after seeding

3. **Create validation scripts**
   - Automated checks can catch issues early
   - Useful for CI/CD pipelines

4. **Document data structure**
   - Clear examples of correct vs incorrect patterns
   - Prevents future mistakes

## Status

✅ **Issue Resolved** - All 77 fields have been fixed and verified.

---

**Fixed Date:** 2025-12-16
**Script Location:** `/payload-cms/scripts/fix-all-homepage-globals.ts`
**Verification Script:** `/payload-cms/scripts/check-all-homepage-globals.ts`
