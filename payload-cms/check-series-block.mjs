import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function checkSeriesBlock() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    const res = await client.query(`
      SELECT id, slug, status FROM series_reusable_blocks WHERE id = 1
    `);
    console.log('Series Block ID 1:', res.rows[0]);

    if (res.rows[0]) {
      const resLoc = await client.query(`
        SELECT _locale, content_translation FROM series_reusable_blocks_locales WHERE _parent_id = 1
      `);
      console.log('Locales for ID 1:', resLoc.rows.map(r => ({ locale: r._locale, hasContent: !!r.content_translation })));
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkSeriesBlock();
