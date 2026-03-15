import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function listAllReusableBlocks() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // List all blocks in all 3 collections
    const collections = [
       { table: 'series_reusable_blocks', name: 'Series' },
       { table: 'product_reusable_blocks', name: 'Product' },
       { table: 'reusable_blocks', name: 'General' }
    ];

    for (const c of collections) {
      const res = await client.query(`SELECT id, slug, status FROM ${c.table}`);
      console.log(`${c.name} Blocks:`, res.rows);
    }

    // Now scan SeriesTemplate locales for ALL reusable blocks to see what's used
    const resTpl = await client.query(`SELECT _parent_id, _locale, content FROM series_templates_locales`);
    for (const row of resTpl.rows) {
       const contentStr = JSON.stringify(row.content);
       if (contentStr.includes('eusableBlock')) {
         console.log(`Reference found in Template ID ${row._parent_id} (${row._locale})`);
         // Extract IDs
         const regex = /"(?:reusableBlock|seriesReusableBlock|productReusableBlock)":\{"id":"([^"]+)"\}/g;
         let match;
         while ((match = regex.exec(contentStr)) !== null) {
           console.log(`  -> Used ID: ${match[1]}`);
         }
       }
    }

    // Also scan ProductSeries locales
    const resSeries = await client.query(`SELECT _parent_id, _locale, content_translation FROM product_series_locales`);
    for (const row of resSeries.rows) {
       const contentStr = JSON.stringify(row.content_translation);
       if (contentStr && contentStr.includes('eusableBlock')) {
         console.log(`Reference found in ProductSeries ID ${row._parent_id} (${row._locale})`);
         const regex = /"(?:reusableBlock|seriesReusableBlock|productReusableBlock)":\{"id":"([^"]+)"\}/g;
         let match;
         while ((match = regex.exec(contentStr)) !== null) {
           console.log(`  -> Used ID: ${match[1]}`);
         }
       }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

listAllReusableBlocks();
