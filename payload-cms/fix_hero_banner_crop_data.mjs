import pg from 'pg';
const { Client } = pg;

// AWS RDS Production Database URL
const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function fixHeroBannerCropData() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    console.log('Connecting to AWS RDS Production Database...');
    await client.connect();
    console.log('Connected.');

    // Step 1: Check current columns in hero_banner_items
    console.log('\n📋 Current columns in hero_banner_items:');
    const currentCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'hero_banner_items'
      ORDER BY ordinal_position;
    `);
    currentCols.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));

    // Step 2: Add missing crop_data columns
    console.log('\n🔧 Adding missing crop_data columns to hero_banner_items...');

    const alterQueries = [
      'ALTER TABLE hero_banner_items ADD COLUMN IF NOT EXISTS "image1_crop_data" jsonb;',
      'ALTER TABLE hero_banner_items ADD COLUMN IF NOT EXISTS "image2_crop_data" jsonb;',
      'ALTER TABLE hero_banner_items ADD COLUMN IF NOT EXISTS "image3_crop_data" jsonb;',
      'ALTER TABLE hero_banner_items ADD COLUMN IF NOT EXISTS "image4_crop_data" jsonb;',
    ];

    for (const q of alterQueries) {
      await client.query(q);
      const colName = q.match(/"([^"]+)"/)?.[1];
      console.log(`  ✅ ${colName} added (or already exists).`);
    }

    // Step 3: Also check if cta_button_link exists (the query references it)
    const ctaCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'hero_banner_items' AND column_name = 'cta_button_link';
    `);
    if (ctaCheck.rows.length === 0) {
      console.log('\n🔧 Adding missing cta_button_link column...');
      await client.query('ALTER TABLE hero_banner_items ADD COLUMN IF NOT EXISTS "cta_button_link" varchar;');
      console.log('  ✅ cta_button_link added.');
    }

    // Step 4: Check hero_banner_items_locales table for missing columns
    console.log('\n📋 Checking hero_banner_items_locales columns...');
    const localeCols = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'hero_banner_items_locales'
      ORDER BY ordinal_position;
    `);
    const existingLocaleCols = localeCols.rows.map(r => r.column_name);
    console.log('  Current locale columns:', existingLocaleCols.join(', '));

    const requiredLocaleCols = ['title', 'feature1', 'feature2', 'feature3', 'feature4', 'feature5', 'cta_button_text', '_locale', '_parent_id'];
    const missingLocaleCols = requiredLocaleCols.filter(c => !existingLocaleCols.includes(c));

    if (missingLocaleCols.length > 0) {
      console.log(`\n🔧 Adding missing locale columns: ${missingLocaleCols.join(', ')}`);
      for (const col of missingLocaleCols) {
        if (col === '_locale' || col === '_parent_id') continue; // structural cols, should exist
        await client.query(`ALTER TABLE hero_banner_items_locales ADD COLUMN IF NOT EXISTS "${col}" text;`);
        console.log(`  ✅ ${col} added to hero_banner_items_locales.`);
      }
    } else {
      console.log('  ✅ All required locale columns exist.');
    }

    // Step 5: Verify all columns now exist
    console.log('\n✅ Verification - hero_banner_items columns after fix:');
    const updatedCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'hero_banner_items'
      ORDER BY ordinal_position;
    `);
    updatedCols.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));

    // Verify the specific columns from the error query
    const requiredMainCols = ['image1_crop_data', 'image2_crop_data', 'image3_crop_data', 'image4_crop_data', 'cta_button_link'];
    const updatedColNames = updatedCols.rows.map(r => r.column_name);
    const stillMissing = requiredMainCols.filter(c => !updatedColNames.includes(c));

    if (stillMissing.length === 0) {
      console.log('\n🎉 All required columns are now present! The hero_banner_items query should work.');
    } else {
      console.error(`\n❌ Still missing columns: ${stillMissing.join(', ')}`);
    }

  } catch (err) {
    console.error('❌ Error fixing production database:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('Note: RDS instance may not be reachable from your current IP (Security Group restriction).');
    }
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

fixHeroBannerCropData();
