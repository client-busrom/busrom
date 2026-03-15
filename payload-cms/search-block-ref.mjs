import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function searchProductBlockRef() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // Search in all templates locales for ID "1" as a productReusableBlock
    const res = await client.query(`
      SELECT _parent_id, _locale, content FROM series_templates_locales
    `);

    for (const row of res.rows) {
      const contentStr = JSON.stringify(row.content);
      if (contentStr && contentStr.includes('productReusableBlock') && contentStr.includes('"1"')) {
        console.log(`Found productReusableBlock ID 1 ref in SeriesTemplate ${_parent_id} (${_locale})`);
      }
    }
    
    // Also check product-series direct content
    const resSeries = await client.query(`SELECT _parent_id, _locale, content_translation FROM product_series_locales`);
    for (const row of resSeries.rows) {
      const contentStr = JSON.stringify(row.content_translation);
      if (contentStr && contentStr.includes('productReusableBlock') && contentStr.includes('"1"')) {
        console.log(`Found productReusableBlock ID 1 ref in ProductSeries record ${row._parent_id} (${row._locale})`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

searchProductBlockRef();
