import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

const { Client } = pg;

async function checkPagesLocales() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'pages_locales'"
    );

    console.log("Columns in 'pages_locales':");
    console.log(res.rows.map(r => r.column_name));

    // Also fetch 'our-story' data
    const dataRes = await client.query(`
      SELECT pl.* FROM pages_locales pl
      JOIN pages p ON pl._parent_id = p.id
      WHERE p.slug = 'our-story'
    `);
    
    console.log("our-story locale data:");
    console.log(JSON.stringify(dataRes.rows, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkPagesLocales();
