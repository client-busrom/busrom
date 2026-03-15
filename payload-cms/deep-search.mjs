import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function searchByIdString() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // We know ID is 1. Search for ID "1" in any Lexical content
    const tables = [
      { t: 'series_templates_locales', c: 'content', n: 'Template' },
      { t: 'product_series_locales', c: 'content_translation', n: 'Series' },
      { t: 'products_locales', c: 'content_translation', n: 'Product' }
    ];

    for (const table of tables) {
      const res = await client.query(`SELECT _parent_id, _locale, ${table.c} as content FROM ${table.t}`);
      for (const row of res.rows) {
        if (!row.content) continue;
        const str = JSON.stringify(row.content);
        // Look for "productReusableBlock":{"id":"1"} or similar inside the data blob
        // Since we want to find why product-detail-common is missing, let's search for "1"
        if (str.includes('"1"')) {
           // check if it has "productReusableBlock" or "seriesReusableBlock" nearby
           if (str.includes('productReusableBlock') || str.includes('seriesReusableBlock')) {
              console.log(`${table.n} ID ${row._parent_id} (${row._locale}) contains both block types and ID "1"`);
              // Find the exact node
              function find(nodes) {
                if (!nodes) return;
                for (const n of nodes) {
                  if (n.type?.includes('ReusableBlock') && (n.data?.seriesReusableBlock?.id === '1' || n.data?.productReusableBlock?.id === '1')) {
                    console.log(`  -> Match: Node Type: ${n.type}, Data: ${JSON.stringify(n.data)}`);
                  }
                  if (n.children) find(n.children);
                  if (n.root) find(n.root.children);
                }
              }
              find(row.content.root?.children);
           }
        }
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

searchByIdString();
