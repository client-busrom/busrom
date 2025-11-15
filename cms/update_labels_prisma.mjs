import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHeroBannerLabels() {
  try {
    // Get all HeroBannerItems
    const items = await prisma.heroBannerItem.findMany({
      select: {
        id: true,
        order: true,
        internalLabel: true,
      },
    });

    console.log(`Found ${items.length} HeroBannerItems\n`);

    for (const item of items) {
      const newLabel = `Hero Banner Item #${item.order}`;

      if (item.internalLabel === newLabel) {
        console.log(`✓ Item order ${item.order} already has correct label`);
        continue;
      }

      await prisma.heroBannerItem.update({
        where: { id: item.id },
        data: { internalLabel: newLabel },
      });

      console.log(`✅ Updated item order ${item.order}: "${newLabel}"`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function updateServiceFeaturesConfig() {
  try {
    const configs = await prisma.serviceFeaturesConfig.findMany();

    console.log(`\nFound ${configs.length} ServiceFeaturesConfig records\n`);

    for (const config of configs) {
      if (config.internalLabel === 'Service Features Configuration') {
        console.log('✓ ServiceFeaturesConfig already has correct label');
        continue;
      }

      await prisma.serviceFeaturesConfig.update({
        where: { id: config.id },
        data: { internalLabel: 'Service Features Configuration' },
      });

      console.log('✅ Updated ServiceFeaturesConfig label');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function updateSimpleCta() {
  try {
    const ctas = await prisma.simpleCta.findMany();

    console.log(`\nFound ${ctas.length} SimpleCta records\n`);

    for (const cta of ctas) {
      if (cta.internalLabel === 'Simple CTA Configuration') {
        console.log('✓ SimpleCta already has correct label');
        continue;
      }

      await prisma.simpleCta.update({
        where: { id: cta.id },
        data: { internalLabel: 'Simple CTA Configuration' },
      });

      console.log('✅ Updated SimpleCta label');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function main() {
  console.log('📝 Updating internal labels in database...\n');

  await updateHeroBannerLabels();
  await updateServiceFeaturesConfig();
  await updateSimpleCta();

  console.log('\n🎉 All updates complete!');
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
