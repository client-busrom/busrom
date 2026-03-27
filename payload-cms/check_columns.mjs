import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

const { Client } = pg;

async function checkColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'pages'"
    );

    console.log("Column names in 'pages' table:");
    console.log(res.rows.map(r => r.column_name));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkColumns();
