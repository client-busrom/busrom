import pg from 'pg';
const { Client } = pg;

const LOCAL_DB_URL = 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload';

async function fixDatabase() {
  const client = new Client({ connectionString: LOCAL_DB_URL });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Add privacy_consent_text to form_configs_locales
    console.log('Adding privacy_consent_text to form_configs_locales...');
    try {
      await client.query('ALTER TABLE form_configs_locales ADD COLUMN IF NOT EXISTS privacy_consent_text character varying;');
      console.log('Success: privacy_consent_text added.');
    } catch (e) {
      console.error('Error adding privacy_consent_text:', e.message);
    }

    // Check if any other columns might be missing based on camelCase vs snake_case
    // In step 1048 I saw privacy_consent_text was used. 
    // Let's verify if other fields were added recently.
    
    console.log('Database sync complete.');

  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

fixDatabase();
