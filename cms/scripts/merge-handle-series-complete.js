/**
 * Complete merge script: bathroom-handle + door-handle → bathroom-door-handle
 *
 * This script merges:
 * 1. MediaTag: series-bathroom-handle + series-door-handle → series-bathroom-door-handle
 * 2. ProductSeries: bathroom-handle + door-handle → bathroom-door-handle
 * 3. Category: bathroom-handle + door-handle → bathroom-door-handle
 * 4. NavigationMenu: Merge related navigation items
 *
 * Usage:
 *   Local:      node scripts/merge-handle-series-complete.js
 *   Production: DATABASE_URL="postgresql://..." node scripts/merge-handle-series-complete.js
 *
 * Options:
 *   --dry-run   Preview changes without modifying database
 */

const { PrismaClient } = require('.prisma/client');

const DRY_RUN = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

// New merged entity names
const NEW_SLUG = 'bathroom-door-handle';
const NEW_TAG_SLUG = 'series-bathroom-door-handle';
const NEW_NAME = {
  en: 'Bathroom & Door Handle',
  zh: '浴室&大门拉手',
};

async function main() {
  console.log('🚀 Merge Script: bathroom-handle + door-handle → bathroom-door-handle');
  console.log(`   Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes)' : '⚡ LIVE (will modify database)'}\n`);

  // ============================================================
  // Step 1: Gather current state
  // ============================================================
  console.log('📊 Step 1: Gathering current state...\n');

  // Get old MediaTags
  const oldMediaTags = await prisma.mediaTag.findMany({
    where: { slug: { in: ['series-bathroom-handle', 'series-door-handle'] } },
  });
  console.log('   MediaTags found:');
  for (const tag of oldMediaTags) {
    const count = await prisma.media.count({
      where: { tags: { some: { id: tag.id } } },
    });
    console.log(`   - ${tag.slug}: ${count} media files (ID: ${tag.id})`);
  }

  // Get old ProductSeries
  const oldProductSeries = await prisma.productSeries.findMany({
    where: { slug: { in: ['bathroom-handle', 'door-handle'] } },
  });
  console.log('\n   ProductSeries found:');
  for (const series of oldProductSeries) {
    console.log(`   - ${series.slug} (ID: ${series.id}, status: ${series.status})`);
  }

  // Get old Categories
  const oldCategories = await prisma.category.findMany({
    where: { slug: { in: ['bathroom-handle', 'door-handle'] } },
  });
  console.log('\n   Categories found:');
  for (const cat of oldCategories) {
    console.log(`   - ${cat.slug} (ID: ${cat.id}, type: ${cat.type})`);
  }

  // Get old NavigationMenus
  const oldNavMenus = await prisma.navigationMenu.findMany({
    where: {
      slug: {
        in: [
          'product-bathroom-handle',
          'product-door-handle',
          'shop-bathroom-handle',
          'shop-door-handle',
        ],
      },
    },
  });
  console.log('\n   NavigationMenus found:');
  for (const nav of oldNavMenus) {
    console.log(`   - ${nav.slug} (ID: ${nav.id})`);
  }

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN - Showing what would be created/modified:\n');
  }

  // ============================================================
  // Step 2: Create new MediaTag
  // ============================================================
  console.log('\n📝 Step 2: Creating new MediaTag...');

  let newMediaTag = await prisma.mediaTag.findFirst({
    where: { slug: NEW_TAG_SLUG },
  });

  if (newMediaTag) {
    console.log(`   ✅ Already exists: ${newMediaTag.id}`);
  } else if (DRY_RUN) {
    console.log(`   Would create: ${NEW_TAG_SLUG}`);
    newMediaTag = { id: 'dry-run-media-tag-id' };
  } else {
    newMediaTag = await prisma.mediaTag.create({
      data: {
        slug: NEW_TAG_SLUG,
        name: NEW_NAME,
        type: 'PRODUCT_SERIES',
        order: 8,
      },
    });
    console.log(`   ✅ Created: ${newMediaTag.id}`);
  }

  // ============================================================
  // Step 3: Create new ProductSeries
  // ============================================================
  console.log('\n📝 Step 3: Creating new ProductSeries...');

  let newProductSeries = await prisma.productSeries.findFirst({
    where: { slug: NEW_SLUG },
  });

  if (newProductSeries) {
    console.log(`   ✅ Already exists: ${newProductSeries.id}`);
  } else if (DRY_RUN) {
    console.log(`   Would create: ${NEW_SLUG}`);
    newProductSeries = { id: 'dry-run-product-series-id' };
  } else {
    // Copy data from existing bathroom-handle series
    const existingSeries = oldProductSeries.find((s) => s.slug === 'bathroom-handle');
    newProductSeries = await prisma.productSeries.create({
      data: {
        slug: NEW_SLUG,
        name: NEW_NAME,
        description: existingSeries?.description || {},
        featuredImage: existingSeries?.featuredImage || undefined,
        order: existingSeries?.order || 8,
        status: 'PUBLISHED',
      },
    });
    console.log(`   ✅ Created: ${newProductSeries.id}`);
  }

  // ============================================================
  // Step 4: Create new Category
  // ============================================================
  console.log('\n📝 Step 4: Creating new Category...');

  let newCategory = await prisma.category.findFirst({
    where: { slug: NEW_SLUG },
  });

  if (newCategory) {
    console.log(`   ✅ Already exists: ${newCategory.id}`);
  } else if (DRY_RUN) {
    console.log(`   Would create: ${NEW_SLUG}`);
    newCategory = { id: 'dry-run-category-id' };
  } else {
    const existingCat = oldCategories.find((c) => c.slug === 'bathroom-handle');
    newCategory = await prisma.category.create({
      data: {
        slug: NEW_SLUG,
        name: NEW_NAME,
        type: existingCat?.type || 'PRODUCT',
        order: existingCat?.order || 8,
        status: 'ACTIVE',
      },
    });
    console.log(`   ✅ Created: ${newCategory.id}`);
  }

  // ============================================================
  // Step 5: Create new NavigationMenus
  // ============================================================
  console.log('\n📝 Step 5: Creating new NavigationMenus...');

  const navSlugsToCreate = ['product-bathroom-door-handle', 'shop-bathroom-door-handle'];
  for (const navSlug of navSlugsToCreate) {
    let navMenu = await prisma.navigationMenu.findFirst({
      where: { slug: navSlug },
    });

    if (navMenu) {
      console.log(`   ✅ Already exists: ${navSlug}`);
    } else if (DRY_RUN) {
      console.log(`   Would create: ${navSlug}`);
    } else {
      // Copy from existing bathroom-handle nav
      const existingNav = oldNavMenus.find((n) => n.slug === navSlug.replace('-door', ''));
      navMenu = await prisma.navigationMenu.create({
        data: {
          slug: navSlug,
          name: NEW_NAME,
          type: existingNav?.type || 'STANDARD',
          link: existingNav?.link?.replace('bathroom-handle', NEW_SLUG) || `/${NEW_SLUG}`,
          order: existingNav?.order || 8,
          visible: true,
        },
      });
      console.log(`   ✅ Created: ${navSlug}`);
    }
  }

  // ============================================================
  // Step 6: Migrate Media tags
  // ============================================================
  console.log('\n🔄 Step 6: Migrating Media tags...');

  const oldTagIds = oldMediaTags.map((t) => t.id);
  const mediaToMigrate = await prisma.media.findMany({
    where: { tags: { some: { id: { in: oldTagIds } } } },
    select: { id: true, filename: true },
  });

  console.log(`   Found ${mediaToMigrate.length} media files to migrate`);

  if (DRY_RUN) {
    console.log(`   Would migrate ${mediaToMigrate.length} media files`);
  } else {
    let migrated = 0;
    for (const media of mediaToMigrate) {
      await prisma.media.update({
        where: { id: media.id },
        data: {
          tags: {
            disconnect: oldTagIds.map((id) => ({ id })),
            connect: { id: newMediaTag.id },
          },
          tagsFilter: {
            disconnect: oldTagIds.map((id) => ({ id })),
            connect: { id: newMediaTag.id },
          },
        },
      });
      migrated++;
      if (migrated % 100 === 0) {
        console.log(`   ... processed ${migrated}/${mediaToMigrate.length}`);
      }
    }
    console.log(`   ✅ Migrated ${migrated} media files`);
  }

  // ============================================================
  // Step 7: Migrate Products (if any)
  // ============================================================
  console.log('\n🔄 Step 7: Migrating Products...');

  const oldSeriesIds = oldProductSeries.map((s) => s.id);
  const productsToMigrate = await prisma.product.findMany({
    where: { seriesId: { in: oldSeriesIds } },
    select: { id: true, name: true },
  });

  console.log(`   Found ${productsToMigrate.length} products to migrate`);

  if (productsToMigrate.length > 0) {
    if (DRY_RUN) {
      console.log(`   Would migrate ${productsToMigrate.length} products`);
    } else {
      await prisma.product.updateMany({
        where: { seriesId: { in: oldSeriesIds } },
        data: { seriesId: newProductSeries.id },
      });
      console.log(`   ✅ Migrated ${productsToMigrate.length} products`);
    }
  }

  // ============================================================
  // Step 8: Archive old records
  // ============================================================
  console.log('\n📦 Step 8: Archiving old records...');

  if (DRY_RUN) {
    console.log('   Would archive:');
    console.log(`   - MediaTags: ${oldMediaTags.map((t) => t.slug).join(', ')}`);
    console.log(`   - ProductSeries: ${oldProductSeries.map((s) => s.slug).join(', ')}`);
    console.log(`   - Categories: ${oldCategories.map((c) => c.slug).join(', ')}`);
    console.log(`   - NavigationMenus: ${oldNavMenus.map((n) => n.slug).join(', ')}`);
  } else {
    // Archive MediaTags
    for (const tag of oldMediaTags) {
      await prisma.mediaTag.update({
        where: { id: tag.id },
        data: { slug: `${tag.slug}-archived`, order: 999 },
      });
    }
    console.log('   ✅ Archived MediaTags');

    // Archive ProductSeries
    for (const series of oldProductSeries) {
      await prisma.productSeries.update({
        where: { id: series.id },
        data: { status: 'ARCHIVED' },
      });
    }
    console.log('   ✅ Archived ProductSeries');

    // Archive Categories
    for (const cat of oldCategories) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { status: 'ARCHIVED' },
      });
    }
    console.log('   ✅ Archived Categories');

    // Delete old NavigationMenus
    for (const nav of oldNavMenus) {
      await prisma.navigationMenu.delete({
        where: { id: nav.id },
      });
    }
    console.log('   ✅ Deleted old NavigationMenus');
  }

  // ============================================================
  // Step 9: Verify final state
  // ============================================================
  console.log('\n✅ Step 9: Verifying final state...');

  if (!DRY_RUN) {
    const finalMediaCount = await prisma.media.count({
      where: { tags: { some: { id: newMediaTag.id } } },
    });
    console.log(`   - ${NEW_TAG_SLUG}: ${finalMediaCount} media files`);

    const finalProductCount = await prisma.product.count({
      where: { seriesId: newProductSeries.id },
    });
    console.log(`   - ${NEW_SLUG} ProductSeries: ${finalProductCount} products`);
  }

  console.log('\n🎉 Merge completed successfully!');
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes.');
  }
}

main()
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
