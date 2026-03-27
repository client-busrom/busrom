import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

const { Client } = pg;

async function checkContent() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    // Find page with slug 'our-story'
    const res = await client.query(
      "SELECT id, slug, content_translation FROM pages WHERE slug = 'our-story' LIMIT 1"
    );

    if (res.rows.length === 0) {
      console.log("Page 'our-story' not found.");
      return;
    }

    const { id, slug, content_translation } = res.rows[0];
    console.log(`Found page: ${slug} (ID: ${id})`);
    
    // content_translation is localized in Payload 3.x if using 'localized: true'
    // Usually it's a JSON object like { en: { root: { ... } }, zh: { ... } }
    console.log("Content Structure:");
    console.log(JSON.stringify(content_translation, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkContent();
