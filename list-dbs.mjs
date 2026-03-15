import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=no-verify';

async function listDbs() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    const result = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('Databases:');
    result.rows.forEach(row => console.log(`  ${row.datname}`));
  } catch (err) {
    console.error('Error listing dbs:', err);
  } finally {
    await client.end();
  }
}

listDbs();
