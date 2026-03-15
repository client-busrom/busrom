import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function logTypedRefs() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    const resTpl = await client.query(`SELECT _locale, content FROM series_templates_locales WHERE _parent_id = 1`);
    for (const row of resTpl.rows) {
       const contentStr = JSON.stringify(row.content);
       const regex = /"type":"(seriesReusableBlock|productReusableBlock|reusableBlock)","data":\{"[^"]+":\{"id":"([^"]+)"/g;
       let match;
       while ((match = regex.exec(contentStr)) !== null) {
         console.log(`Locale ${row._locale} uses ${match[1]} ID ${match[2]}`);
       }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

logTypedRefs();
