import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function logSeriesBlockContent() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    const res = await client.query(`SELECT _locale, content_translation FROM series_reusable_blocks_locales WHERE _parent_id = 1`);
    for (const row of res.rows) {
       const contentStr = JSON.stringify(row.content_translation);
       if (contentStr && contentStr.includes('reusableBlock')) {
          console.log(`Series Block 1 (${row._locale}) contains reusable blocks!`);
          console.log('Content:', contentStr);
       }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

logSeriesBlockContent();
