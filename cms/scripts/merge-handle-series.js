/**
 * Merge bathroom-handle and door-handle into bathroom-door-handle
 *
 * This script:
 * 1. Creates a new MediaTag: series-bathroom-door-handle
 * 2. Creates a new ProductSeries: bathroom-door-handle
 * 3. Updates all Media with old tags to use the new tag
 * 4. Archives the old MediaTags and ProductSeries
 *
 * Run with:
 * DATABASE_URL="postgresql://..." node scripts/merge-handle-series.js
 */

const { PrismaClient } = require('.prisma/client');

const prisma = new PrismaClient();

// IDs from production database
const OLD_MEDIA_TAGS = {
  'series-bathroom-handle': '64eeaf68-cfc4-4368-99a5-9bb47964eb45',
  'series-door-handle': '54e6463c-f3d6-4f0e-880f-a14a0ff2dcbc',
};

const OLD_PRODUCT_SERIES = {
  'bathroom-handle': 'fece235f-2673-4543-9209-9378535e5e62',
  'door-handle': 'f1df15ef-01dc-42a4-a638-c335bf852c3e',
};

async function main() {
  console.log('🚀 Starting merge: bathroom-handle + door-handle → bathroom-door-handle\n');

  // Step 1: Check current state
  console.log('📊 Step 1: Checking current state...');

  const bathroomHandleMedia = await prisma.media.count({
    where: { tags: { some: { id: OLD_MEDIA_TAGS['series-bathroom-handle'] } } }
  });
  const doorHandleMedia = await prisma.media.count({
    where: { tags: { some: { id: OLD_MEDIA_TAGS['series-door-handle'] } } }
  });

  console.log(`   - series-bathroom-handle: ${bathroomHandleMedia} media files`);
  console.log(`   - series-door-handle: ${doorHandleMedia} media files`);
  console.log(`   - Total to merge: ${bathroomHandleMedia + doorHandleMedia} media files\n`);

  // Step 2: Create new MediaTag
  console.log('📝 Step 2: Creating new MediaTag...');

  let newMediaTag = await prisma.mediaTag.findFirst({
    where: { slug: 'series-bathroom-door-handle' }
  });

  if (newMediaTag) {
    console.log(`   ✅ MediaTag already exists: ${newMediaTag.id}\n`);
  } else {
    newMediaTag = await prisma.mediaTag.create({
      data: {
        slug: 'series-bathroom-door-handle',
        name: {
          en: 'Bathroom & Door Handle',
          zh: '浴室&大门拉手',
        },
        type: 'PRODUCT_SERIES',
        order: 8, // Same position as bathroom-handle
      }
    });
    console.log(`   ✅ Created MediaTag: ${newMediaTag.id}\n`);
  }

  // Step 3: Create new ProductSeries
  console.log('📝 Step 3: Creating new ProductSeries...');

  let newProductSeries = await prisma.productSeries.findFirst({
    where: { slug: 'bathroom-door-handle' }
  });

  if (newProductSeries) {
    console.log(`   ✅ ProductSeries already exists: ${newProductSeries.id}\n`);
  } else {
    // Get data from existing bathroom-handle series to copy
    const existingSeries = await prisma.productSeries.findFirst({
      where: { slug: 'bathroom-handle' }
    });

    newProductSeries = await prisma.productSeries.create({
      data: {
        slug: 'bathroom-door-handle',
        name: {
          en: 'Bathroom & Door Handle',
          zh: '浴室&大门拉手',
        },
        description: existingSeries?.description || {},
        featuredImage: existingSeries?.featuredImage || null,
        order: existingSeries?.order || 8,
        status: 'PUBLISHED',
      }
    });
    console.log(`   ✅ Created ProductSeries: ${newProductSeries.id}\n`);
  }

  // Step 4: Update Media tags - bathroom-handle
  console.log('🔄 Step 4: Updating Media tags (bathroom-handle → bathroom-door-handle)...');

  const bathroomHandleMediaItems = await prisma.media.findMany({
    where: { tags: { some: { id: OLD_MEDIA_TAGS['series-bathroom-handle'] } } },
    select: { id: true }
  });

  let updated1 = 0;
  for (const media of bathroomHandleMediaItems) {
    await prisma.media.update({
      where: { id: media.id },
      data: {
        tags: {
          disconnect: { id: OLD_MEDIA_TAGS['series-bathroom-handle'] },
          connect: { id: newMediaTag.id }
        },
        tagsFilter: {
          disconnect: { id: OLD_MEDIA_TAGS['series-bathroom-handle'] },
          connect: { id: newMediaTag.id }
        }
      }
    });
    updated1++;
    if (updated1 % 100 === 0) {
      console.log(`   ... processed ${updated1}/${bathroomHandleMediaItems.length}`);
    }
  }
  console.log(`   ✅ Updated ${updated1} media files from bathroom-handle\n`);

  // Step 5: Update Media tags - door-handle
  console.log('🔄 Step 5: Updating Media tags (door-handle → bathroom-door-handle)...');

  const doorHandleMediaItems = await prisma.media.findMany({
    where: { tags: { some: { id: OLD_MEDIA_TAGS['series-door-handle'] } } },
    select: { id: true }
  });

  let updated2 = 0;
  for (const media of doorHandleMediaItems) {
    await prisma.media.update({
      where: { id: media.id },
      data: {
        tags: {
          disconnect: { id: OLD_MEDIA_TAGS['series-door-handle'] },
          connect: { id: newMediaTag.id }
        },
        tagsFilter: {
          disconnect: { id: OLD_MEDIA_TAGS['series-door-handle'] },
          connect: { id: newMediaTag.id }
        }
      }
    });
    updated2++;
    if (updated2 % 100 === 0) {
      console.log(`   ... processed ${updated2}/${doorHandleMediaItems.length}`);
    }
  }
  console.log(`   ✅ Updated ${updated2} media files from door-handle\n`);

  // Step 6: Archive old MediaTags (soft delete by renaming)
  console.log('📦 Step 6: Archiving old MediaTags...');

  await prisma.mediaTag.update({
    where: { id: OLD_MEDIA_TAGS['series-bathroom-handle'] },
    data: {
      slug: 'series-bathroom-handle-archived',
      order: 999
    }
  });
  await prisma.mediaTag.update({
    where: { id: OLD_MEDIA_TAGS['series-door-handle'] },
    data: {
      slug: 'series-door-handle-archived',
      order: 999
    }
  });
  console.log('   ✅ Archived old MediaTags\n');

  // Step 7: Archive old ProductSeries
  console.log('📦 Step 7: Archiving old ProductSeries...');

  await prisma.productSeries.update({
    where: { id: OLD_PRODUCT_SERIES['bathroom-handle'] },
    data: { status: 'ARCHIVED' }
  });
  await prisma.productSeries.update({
    where: { id: OLD_PRODUCT_SERIES['door-handle'] },
    data: { status: 'ARCHIVED' }
  });
  console.log('   ✅ Archived old ProductSeries\n');

  // Step 8: Verify final state
  console.log('✅ Step 8: Verifying final state...');

  const newMediaCount = await prisma.media.count({
    where: { tags: { some: { id: newMediaTag.id } } }
  });
  console.log(`   - series-bathroom-door-handle: ${newMediaCount} media files`);

  const oldBathroomCount = await prisma.media.count({
    where: { tags: { some: { id: OLD_MEDIA_TAGS['series-bathroom-handle'] } } }
  });
  const oldDoorCount = await prisma.media.count({
    where: { tags: { some: { id: OLD_MEDIA_TAGS['series-door-handle'] } } }
  });
  console.log(`   - series-bathroom-handle-archived: ${oldBathroomCount} media files`);
  console.log(`   - series-door-handle-archived: ${oldDoorCount} media files`);

  console.log('\n🎉 Merge completed successfully!');
  console.log(`   Total: ${newMediaCount} media files now tagged as bathroom-door-handle`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
