/**
 * Generate Variants for All Media Records
 *
 * This script adds variants URLs to all Media records that don't have them.
 * For batch-imported images where Keystone hooks were bypassed.
 *
 * Run:
 *   DATABASE_URL="..." CDN_DOMAIN="d2kqew3hn5wphn.cloudfront.net" node scripts/generate-all-variants-production.js
 */

const { PrismaClient } = require('../cms/node_modules/.prisma/client');

const prisma = new PrismaClient();

const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd2kqew3hn5wphn.cloudfront.net';

async function main() {
  console.log('=== Generate Variants for All Media ===');
  console.log(`CDN: ${CDN_DOMAIN}\n`);

  // Find all media without variants
  const mediaList = await prisma.media.findMany({
    where: {
      OR: [
        { variants: { equals: null } },
        { variants: { equals: {} } },
      ],
    },
    select: {
      id: true,
      filename: true,
      fileUrl: true,
      fileKey: true,
      variants: true,
    },
  });

  console.log(`Found ${mediaList.length} media records without variants\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < mediaList.length; i++) {
    const media = mediaList[i];

    try {
      // Get file URL
      let fileUrl = media.fileUrl;
      if (!fileUrl && media.fileKey) {
        fileUrl = `https://${CDN_DOMAIN}/${media.fileKey}`;
      }

      if (!fileUrl) {
        console.log(`Skipping ${media.filename}: no fileUrl or fileKey`);
        skipped++;
        continue;
      }

      // Generate variants - all pointing to same CDN URL
      // For already-compressed images, we don't need actual resizing
      const variants = {
        original: fileUrl,
        xlarge: fileUrl,
        large: fileUrl,
        medium: fileUrl,
        small: fileUrl,
        thumbnail: fileUrl,
        webp: fileUrl,
      };

      // Update record
      await prisma.media.update({
        where: { id: media.id },
        data: { variants },
      });

      updated++;

      // Progress report every 100 records
      if (updated % 100 === 0) {
        console.log(`Progress: ${updated} updated, ${skipped} skipped, ${errors} errors (${i + 1}/${mediaList.length})`);
      }
    } catch (error) {
      errors++;
      console.error(`Error processing ${media.filename}: ${error.message}`);
    }
  }

  console.log('\n=== Complete ===');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${mediaList.length}`);

  // Verify
  const withVariants = await prisma.media.count({
    where: {
      NOT: [
        { variants: { equals: null } },
        { variants: { equals: {} } },
      ],
    },
  });
  console.log(`\nMedia with variants: ${withVariants}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
