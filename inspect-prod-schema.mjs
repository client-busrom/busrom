import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function inspectSchema() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    
    console.log('--- Document Templates Table Columns ---');
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'document_templates'
      ORDER BY column_name;
    `);
    console.table(cols.rows);

    console.log('--- Document Templates Locales Table Columns ---');
    const localeCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'document_templates_locales'
      ORDER BY column_name;
    `);
    console.table(localeCols.rows);

    console.log('--- Checking for other potential locale issues ---');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%_locales'
      ORDER BY table_name;
    `);
    console.log('Existing Locale Tables:', tables.rows.map(r => r.table_name));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

inspectSchema();
