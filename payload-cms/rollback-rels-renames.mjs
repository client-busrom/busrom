import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function rollbackRelsRenames() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%_rels'
    `);

    const tables = res.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} relationship tables.`);

    for (const table of tables) {
      console.log(`Checking columns for ${table}...`);
      
      const resCols = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);

      const columns = resCols.rows.map(r => r.column_name);

      if (columns.includes('_order') && !columns.includes('order')) {
        console.log(`  Rolling back _order -> order for ${table}...`);
        await client.query(`ALTER TABLE "${table}" RENAME COLUMN "_order" TO "order"`);
      }

      if (columns.includes('_parent_id') && !columns.includes('parent_id')) {
        console.log(`  Rolling back _parent_id -> parent_id for ${table}...`);
        await client.query(`ALTER TABLE "${table}" RENAME COLUMN "_parent_id" TO "parent_id"`);
      }
    }

    console.log('\nRollback complete.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

rollbackRelsRenames();
