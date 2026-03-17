import pg from 'pg';
const { Client } = pg;

const LOCAL_DB_URL = 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload';

async function checkTables() {
  const client = new Client({ connectionString: LOCAL_DB_URL });

  try {
    await client.connect();
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'form_configs%';
    `);
    console.log('Tables found:');
    console.table(tables.rows);

    for (const table of tables.rows) {
      console.log(`--- Table: ${table.table_name} ---`);
      const columns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '${table.table_name}'
        ORDER BY ordinal_position;
      `);
      console.table(columns.rows);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkTables();
