import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function scanProductTemplates() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    const res = await client.query(`SELECT _parent_id, _locale, content FROM product_templates_locales`);
    for (const row of res.rows) {
       const str = JSON.stringify(row.content);
       if (str && str.includes('ReusableBlock')) {
          console.log(`ProductTemplate ID ${row._parent_id} (${row._locale}) has blocks.`);
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

scanProductTemplates();
