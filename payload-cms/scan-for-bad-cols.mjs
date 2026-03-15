import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function testFullFooterQuery() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // Attempting a simple join that uses the fixed columns
    const query = `
      SELECT 
        f.id,
        f.form_config_id,
        fr._order as rel_order,
        fr._parent_id as rel_parent
      FROM "footer" f
      LEFT JOIN "footer_rels" fr ON fr._parent_id = f.id
      LIMIT 1
    `;
    
    console.log('Executing test query...');
    const res = await client.query(query);
    console.log('Success! Result row:', res.rows[0]);

    // Check if there are any other rels tables that are broken
    console.log('\nScanning for non-prefixed system columns in ANY table...');
    const badCols = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (column_name = 'order' OR column_name = 'parent_id')
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE 'sql_%'
    `);
    
    if (badCols.rows.length > 0) {
      console.log('Found tables with non-prefixed columns:');
      console.table(badCols.rows);
    } else {
      console.log('No tables with "order" or "parent_id" found.');
    }

  } catch (err) {
    console.error('SQL Error:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
  } finally {
    await client.end();
  }
}

testFullFooterQuery();
