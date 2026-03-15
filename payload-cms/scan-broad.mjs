import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function scanBroad() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // Template
    const resTpl = await client.query(`SELECT _parent_id, _locale, content FROM series_templates_locales`);
    for (const row of resTpl.rows) {
       const str = JSON.stringify(row.content);
       if (str && str.includes('ReusableBlock')) {
          console.log(`Template ID ${row._parent_id} (${row._locale}) contains reusable string.`);
          // Just find the key and its value
          // Look for any key that ends with ReusableBlock
          const regex = /"([^"]*ReusableBlock)":\s*({[^}]*}|"[^"]*")/g;
          let match;
          while ((match = regex.exec(str)) !== null) {
            console.log(`  -> Key: ${match[1]}, Value: ${match[2]}`);
          }
       }
    }

    // Series
    const resSeries = await client.query(`SELECT _parent_id, _locale, content_translation FROM product_series_locales`);
    for (const row of resSeries.rows) {
       const str = JSON.stringify(row.content_translation);
       if (str && str.includes('ReusableBlock')) {
          console.log(`Series ID ${row._parent_id} (${row._locale}) contains reusable string.`);
          const regex = /"([^"]*ReusableBlock)":\s*({[^}]*}|"[^"]*")/g;
          let match;
          while ((match = regex.exec(str)) !== null) {
            console.log(`  -> Key: ${match[1]}, Value: ${match[2]}`);
          }
       }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

scanBroad();
