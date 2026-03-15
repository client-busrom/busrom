import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms?sslmode=no-verify';

async function findTable() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name ILIKE 'site_config'
      OR table_name ILIKE 'siteconfig';
    `);
    console.log('Matches for site_config:');
    console.log(result.rows);

    const result2 = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name ILIKE 'products%'
      OR table_name ILIKE 'product%';
    `);
    console.log('Matches for products:');
    console.log(result2.rows);

  } catch (err) {
    console.error('Error finding table:', err);
  } finally {
    await client.end();
  }
}

findTable();
