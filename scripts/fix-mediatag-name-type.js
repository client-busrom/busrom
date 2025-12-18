/**
 * Fix MediaTag name and type fields in production database
 *
 * This script:
 * 1. Finds all MediaTags with incorrect name format (string instead of JSON)
 * 2. Finds all MediaTags with incorrect type (CUSTOM when should be specific type)
 * 3. Updates them with correct values
 *
 * Run:
 *   DATABASE_URL="postgresql://..." node scripts/fix-mediatag-name-type.js
 *
 * Dry run (preview only):
 *   DATABASE_URL="postgresql://..." node scripts/fix-mediatag-name-type.js --dry-run
 */

const { PrismaClient } = require('../cms/node_modules/.prisma/client');
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Get tag type from slug prefix
 */
function getTagTypeFromSlug(slug) {
  if (slug.startsWith('series-')) return 'PRODUCT_SERIES';
  if (slug.startsWith('type-')) return 'FUNCTION_TYPE';
  if (slug.startsWith('func-')) return 'FUNCTION_TYPE';
  if (slug.startsWith('scene-')) return 'SCENE_TYPE';
  if (slug.startsWith('spec-')) return 'SPEC';
  if (slug.startsWith('color-')) return 'COLOR';
  return 'CUSTOM';
}

/**
 * Get display name from slug
 */
function getDisplayNameFromSlug(slug) {
  // Remove prefix and convert to title case
  const name = slug
    .replace(/^(series|type|func|scene|spec|color)-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return name;
}

/**
 * Check if name is in correct JSON format with at least 'en' key
 */
function isNameValid(name) {
  if (!name) return false;
  if (typeof name !== 'object') return false;
  if (Array.isArray(name)) return false;
  // Must have 'en' key with non-empty value
  if (!name.en || typeof name.en !== 'string' || name.en.trim() === '') return false;
  return true;
}

async function main() {
  console.log('=== MediaTag Name and Type Fix Script ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (will update database)'}`);
  console.log('');

  // Get all MediaTags
  const allTags = await prisma.mediaTag.findMany({
    orderBy: { slug: 'asc' },
  });

  console.log(`Found ${allTags.length} MediaTags in database\n`);

  const tagsToFix = [];

  for (const tag of allTags) {
    const expectedType = getTagTypeFromSlug(tag.slug);
    const expectedName = { en: getDisplayNameFromSlug(tag.slug) };

    const needsNameFix = !isNameValid(tag.name);
    const needsTypeFix = tag.type !== expectedType;

    if (needsNameFix || needsTypeFix) {
      tagsToFix.push({
        id: tag.id,
        slug: tag.slug,
        currentName: tag.name,
        currentType: tag.type,
        expectedName: needsNameFix ? expectedName : null,
        expectedType: needsTypeFix ? expectedType : null,
        needsNameFix,
        needsTypeFix,
      });
    }
  }

  console.log(`Found ${tagsToFix.length} MediaTags that need fixing:\n`);

  // Group by issue type
  const nameIssues = tagsToFix.filter(t => t.needsNameFix);
  const typeIssues = tagsToFix.filter(t => t.needsTypeFix);

  console.log(`  - Name issues: ${nameIssues.length}`);
  console.log(`  - Type issues: ${typeIssues.length}`);
  console.log('');

  // Show details
  console.log('--- Tags to fix ---');
  for (const tag of tagsToFix) {
    console.log(`\nSlug: ${tag.slug}`);
    if (tag.needsNameFix) {
      console.log(`  Name: ${JSON.stringify(tag.currentName)} -> ${JSON.stringify(tag.expectedName)}`);
    }
    if (tag.needsTypeFix) {
      console.log(`  Type: ${tag.currentType} -> ${tag.expectedType}`);
    }
  }

  if (tagsToFix.length === 0) {
    console.log('\nNo tags need fixing. All good!');
    return;
  }

  if (DRY_RUN) {
    console.log('\n--- DRY RUN: No changes made ---');
    console.log('Run without --dry-run to apply changes.');
    return;
  }

  // Apply fixes
  console.log('\n--- Applying fixes ---');
  let fixed = 0;
  let errors = 0;

  for (const tag of tagsToFix) {
    try {
      const updateData = {};

      if (tag.needsNameFix) {
        updateData.name = tag.expectedName;
      }
      if (tag.needsTypeFix) {
        updateData.type = tag.expectedType;
      }

      await prisma.mediaTag.update({
        where: { id: tag.id },
        data: updateData,
      });

      fixed++;
      console.log(`✓ Fixed: ${tag.slug}`);
    } catch (error) {
      errors++;
      console.error(`✗ Error fixing ${tag.slug}: ${error.message}`);
    }
  }

  console.log('\n=== Fix Complete ===');
  console.log(`Fixed: ${fixed}`);
  console.log(`Errors: ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
