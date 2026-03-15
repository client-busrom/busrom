import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms?sslmode=no-verify';

async function testQuery() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Testing "site_config"...');
    try {
      await client.query('SELECT 1 FROM "site_config" LIMIT 1');
      console.log('✓ "site_config" EXISTS');
    } catch (e) {
      console.log('✗ "site_config" DOES NOT EXIST:', e.message);
    }

    console.log('Testing "SiteConfig"...');
    try {
      await client.query('SELECT 1 FROM "SiteConfig" LIMIT 1');
      console.log('✓ "SiteConfig" EXISTS');
    } catch (e) {
      console.log('✗ "SiteConfig" DOES NOT EXIST:', e.message);
    }
  } finally {
    await client.end();
  }
}

testQuery();
