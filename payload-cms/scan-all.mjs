import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function scanAllSeries() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    const resSeries = await client.query(`SELECT _parent_id, _locale, content_translation FROM product_series_locales`);
    for (const row of resSeries.rows) {
       const str = JSON.stringify(row.content_translation);
       if (str && str.includes('ReusableBlock')) {
          console.log(`ProductSeries ID ${row._parent_id} (${row._locale}) has blocks.`);
          const regex = /"([^"]*ReusableBlock)":\s*({[^}]*}|"[^"]*")/g;
          let match;
          while ((match = regex.exec(str)) !== null) {
            console.log(`  -> Key: ${match[1]}, Value: ${match[2]}`);
          }
       }
    }
    
    // Also scan Templates one more time to be sure
    const resTpl = await client.query(`SELECT _parent_id, _locale, content FROM series_templates_locales`);
    for (const row of resTpl.rows) {
       const str = JSON.stringify(row.content);
       if (str && str.includes('productReusableBlock')) {
          console.log(`Template ID ${row._parent_id} (${row._locale}) has productReusableBlock.`);
          const regex = /"productReusableBlock":\s*({[^}]*}|"[^"]*")/g;
          let match;
          while ((match = regex.exec(str)) !== null) {
            console.log(`  -> Value: ${match[1]}`);
          }
       }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

scanAllSeries();
