import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function diagnoseFooterQuery() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected to RDS.');

    // Try to run a full query like Payload does
    // First, let's check one component at a time.

    console.log('\n--- Testing select from footer ---');
    try {
      const res = await client.query('SELECT * FROM "footer" LIMIT 1');
      console.log('Success: footer table is accessible.');
    } catch (e) {
      console.error('Error on footer:', e.message);
    }

    console.log('\n--- Testing select from footer_rels with _order ---');
    try {
      const res = await client.query('SELECT "_order", "_parent_id" FROM "footer_rels" LIMIT 1');
      console.log('Success: footer_rels has _order and _parent_id.');
    } catch (e) {
      console.error('Error on footer_rels (_order):', e.message);
    }

    console.log('\n--- Testing select from footer_rels with old order ---');
    try {
      const res = await client.query('SELECT "order", "parent_id" FROM "footer_rels" LIMIT 1');
      console.log('Success: footer_rels has "order" (without underscore).');
    } catch (e) {
      console.error('Error on footer_rels (order):', e.message);
    }

    console.log('\n--- Testing payload_preferences_rels ---');
    try {
      const res = await client.query('SELECT * FROM "payload_preferences_rels" LIMIT 1');
      console.log('Success: payload_preferences_rels is accessible.');
    } catch (e) {
      console.error('Error on payload_preferences_rels:', e.message);
    }

    // List all columns in footer_rels one last time
    console.log('\n--- Final check of footer_rels columns ---');
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'footer_rels'
    `);
    cols.rows.forEach(r => console.log(`- ${r.column_name}`));

  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

diagnoseFooterQuery();
