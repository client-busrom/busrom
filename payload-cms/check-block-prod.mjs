import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function checkReusableBlock() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // Find the block by slug in product_reusable_blocks
    console.log('Searching for slug "product-detail-common" in product_reusable_blocks...');
    const res = await client.query(`
      SELECT id, slug, status, created_at, updated_at
      FROM product_reusable_blocks
      WHERE slug = 'product-detail-common'
    `);

    if (res.rows.length === 0) {
      console.log('Block with slug "product-detail-common" NOT FOUND in product_reusable_blocks.');
      
      // Also check series_reusable_blocks
      console.log('Checking series_reusable_blocks...');
      const resSeries = await client.query(`
        SELECT id, slug, status FROM series_reusable_blocks WHERE slug = 'product-detail-common'
      `);
      if (resSeries.rows.length > 0) {
        console.log('Found in series_reusable_blocks:', resSeries.rows[0]);
      } else {
        console.log('Also NOT FOUND in series_reusable_blocks.');
      }
      return;
    }

    const block = res.rows[0];
    console.log('Found block:', block);

    // Check if it has content in product_reusable_blocks_locales
    const resContent = await client.query(`
      SELECT _locale, content_translation, title 
      FROM product_reusable_blocks_locales 
      WHERE _parent_id = $1
    `, [block.id]);
    
    console.log('Content entries found:', resContent.rows.map(r => ({
      locale: r._locale,
      hasContent: !!r.content_translation,
      title: r.title
    })));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkReusableBlock();
