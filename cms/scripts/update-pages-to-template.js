/**
 * Script to update existing pages to TEMPLATE type with specific template names
 *
 * All pages need UI design, so they should be TEMPLATE type instead of FREEFORM
 */

const { PrismaClient } = require('../node_modules/.prisma/client');
const prisma = new PrismaClient();

// Page template mapping
const pageTemplates = {
  // Service pages
  'service-overview': 'SERVICE_OVERVIEW',
  'one-stop-shop': 'ONE_STOP_SHOP',
  'faq': 'FAQ',
  'oem-odm': 'OEM_ODM',

  // About Us pages
  'our-story': 'OUR_STORY',
  'support': 'SUPPORT',
  'privacy-policy': 'PRIVACY_POLICY',
  'fraud-notice': 'FRAUD_NOTICE',

  // List pages (already have templates)
  'applications': 'APPLICATION_LIST',
  'blog': 'BLOG_LIST',
};

async function main() {
  console.log('🔄 Updating pages to TEMPLATE type...\n');

  let updated = 0;
  let skipped = 0;

  for (const [slug, template] of Object.entries(pageTemplates)) {
    try {
      const page = await prisma.page.findUnique({
        where: { slug }
      });

      if (!page) {
        console.log(`⏭️  Skipped: ${slug} (not found)`);
        skipped++;
        continue;
      }

      // Update page to TEMPLATE type
      await prisma.page.update({
        where: { slug },
        data: {
          pageType: 'TEMPLATE',
          template: template,
        }
      });

      console.log(`✅ Updated: ${slug.padEnd(20)} → TEMPLATE (${template})`);
      updated++;

    } catch (error) {
      console.error(`❌ Error updating ${slug}:`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${Object.keys(pageTemplates).length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✨ Done!');
  })
  .catch(async (e) => {
    console.error('Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
