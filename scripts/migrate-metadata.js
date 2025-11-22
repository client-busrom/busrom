const { PrismaClient } = require('.prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('🔍 Connecting to database...');

  try {
    console.log('\n📊 Finding Media with sceneType...');
    const allMedia = await prisma.media.findMany({
      select: {
        id: true,
        filename: true,
        metadata: true
      }
    });

    const mediaWithSceneType = allMedia.filter(m => {
      const meta = m.metadata || {};
      return meta.sceneType !== undefined;
    });

    console.log(`✅ Total Media: ${allMedia.length}`);
    console.log(`✅ Media with sceneType: ${mediaWithSceneType.length}\n`);

    if (mediaWithSceneType.length === 0) {
      console.log('✅ No records to migrate. Done!');
      await prisma.$disconnect();
      return;
    }

    console.log('📋 Sample records before migration:');
    mediaWithSceneType.slice(0, 3).forEach((m, i) => {
      console.log(`  ${i+1}. ${m.filename}`);
      console.log(`     ${JSON.stringify(m.metadata)}`);
    });

    console.log(`\n⚠️  Will update ${mediaWithSceneType.length} records:`);
    console.log('   - Remove: sceneType field');
    console.log('   - Add: combinationNumber = 1\n');

    console.log('🔄 Migrating...');
    let count = 0;

    for (const media of mediaWithSceneType) {
      const currentMeta = media.metadata || {};
      const newMeta = { ...currentMeta, combinationNumber: 1 };
      delete newMeta.sceneType;

      await prisma.media.update({
        where: { id: media.id },
        data: { metadata: newMeta }
      });

      count++;
      if (count % 10 === 0) {
        console.log(`  ✓ Updated ${count}/${mediaWithSceneType.length}...`);
      }
    }

    console.log(`\n✅ Successfully migrated ${count} records!\n`);

    console.log('🔍 Verifying...');
    const allMediaAfter = await prisma.media.findMany({
      select: { id: true, filename: true, metadata: true }
    });

    const stillHaveSceneType = allMediaAfter.filter(m => {
      const meta = m.metadata || {};
      return meta.sceneType !== undefined;
    }).length;

    const haveCombinationNumber = allMediaAfter.filter(m => {
      const meta = m.metadata || {};
      return meta.combinationNumber !== undefined;
    }).length;

    console.log(`✅ Records with sceneType: ${stillHaveSceneType} (should be 0)`);
    console.log(`✅ Records with combinationNumber: ${haveCombinationNumber}\n`);

    const samples = allMediaAfter.filter(m => m.metadata?.combinationNumber).slice(0, 3);
    console.log('📋 Sample records after migration:');
    samples.forEach((m, i) => {
      console.log(`  ${i+1}. ${m.filename}: ${JSON.stringify(m.metadata)}`);
    });

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
