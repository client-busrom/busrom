import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms?sslmode=no-verify';

async function checkStats() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    
    // Check DB size
    const dbSize = await client.query("SELECT pg_size_pretty(pg_database_size('busrom_cms')) as size;");
    console.log(`Database Size: ${dbSize.rows[0].size}`);

    // Check row counts for main tables
    const tables = ['Product', 'Media', 'FormSubmission', 'ActivityLog', 'Page'];
    for (const table of tables) {
      try {
        const count = await client.query(`SELECT COUNT(*) FROM "${table}";`);
        console.log(`${table} count: ${count.rows[0].count}`);
      } catch (e) {
        console.log(`${table} table might not exist or name is case-sensitive.`);
      }
    }

    // Check connection count
    const connCount = await client.query("SELECT count(*) FROM pg_stat_activity;");
    console.log(`Current Connections: ${connCount.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkStats();
