import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms?sslmode=no-verify';

async function findColumn() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_name, column_name
      FROM information_schema.columns 
      WHERE column_name ILIKE '%cloudfront%'
      OR column_name ILIKE '%turnstile%';
    `);
    console.log('Tables with cloudfront or turnstile columns:');
    console.log(result.rows);
  } catch (err) {
    console.error('Error finding column:', err);
  } finally {
    await client.end();
  }
}

findColumn();
