import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

const { Client } = pg;

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );

    console.log("Table names in public schema:");
    console.log(res.rows.map(r => r.table_name));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkTables();
