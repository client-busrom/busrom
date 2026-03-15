import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms?sslmode=no-verify';

async function listAllTables() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name;
    `);
    console.log('All tables:');
    result.rows.forEach(row => console.log(`  ${row.table_schema}.${row.table_name}`));
  } catch (err) {
    console.error('Error listing tables:', err);
  } finally {
    await client.end();
  }
}

listAllTables();
