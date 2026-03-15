import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function scanProductSeries() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // Look for all references in ProductSeries
    const res = await client.query(`SELECT _parent_id, _locale, content_translation FROM product_series_locales`);
    for (const row of res.rows) {
       if (!row.content_translation) continue;
       const contentStr = JSON.stringify(row.content_translation);
       if (contentStr.includes('reusableBlock') || contentStr.includes('seriesReusableBlock') || contentStr.includes('productReusableBlock')) {
         console.log(`ProductSeries ID ${row._parent_id} (${row._locale}) has blocks.`);
         // Print the structure of the block
         function find(nodes) {
           if (!nodes) return;
           for (const n of nodes) {
              if (n.type?.includes('ReusableBlock')) console.log('Node:', JSON.stringify(n));
              if (n.children) find(n.children);
              if (n.root) find(n.root.children);
           }
         }
         find(row.content_translation.root?.children);
       }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

scanProductSeries();
