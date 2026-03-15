import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function checkMainTable() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'document_templates';
    `);
    console.log('Columns in document_templates:', cols.rows.map(r => r.column_name));

    const sample = await client.query('SELECT * FROM document_templates_locales LIMIT 5;');
    console.log('Sample data in locales table:', sample.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkMainTable();
