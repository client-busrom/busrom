import pg from 'pg';

const PROD_DB_URL = process.env.DATABASE_URI || 'postgresql://busrom:busrom_payload_password@busrom-payload-db.c7m0ykw0yk0y.us-east-1.rds.amazonaws.com:5432/busrom_payload';

async function fix() {
  const client = new pg.Client({
    connectionString: PROD_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to production database');

    // --- Add columns to form_configs ---
    const mainTableColumns = [
      ['rate_limit_enabled', 'BOOLEAN DEFAULT TRUE'],
      ['rate_limit_per_ip', 'NUMERIC DEFAULT 5'],
      ['rate_limit_per_day', 'NUMERIC DEFAULT 100'],
      ['min_submit_interval', 'NUMERIC DEFAULT 30'],
      ['captcha_enabled', 'BOOLEAN DEFAULT FALSE'],
      ['captcha_theme', "VARCHAR DEFAULT 'auto'"],
      ['captcha_size', "VARCHAR DEFAULT 'normal'"],
      ['auto_reply_enabled', "VARCHAR DEFAULT 'inherit'"]
    ];

    for (const [col, type] of mainTableColumns) {
      try {
        await client.query(`ALTER TABLE form_configs ADD COLUMN ${col} ${type}`);
        console.log(`Added column ${col} to form_configs`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`Column ${col} already exists in form_configs`);
        } else {
          console.error(`Error adding ${col} to form_configs:`, err.message);
        }
      }
    }

    // --- Add columns to form_configs_locales ---
    const localeTableColumns = [
      ['privacy_consent_text', 'TEXT'],
      ['submit_button_long_text', 'TEXT'],
      ['error_general_message', 'TEXT'],
      ['error_missing_fields_message', 'TEXT'],
      ['error_network_message', 'TEXT'],
      ['error_captcha_message', 'TEXT'],
      ['auto_reply_subject', 'TEXT'],
      ['auto_reply_template', 'JSONB']
    ];

    for (const [col, type] of localeTableColumns) {
      try {
        await client.query(`ALTER TABLE form_configs_locales ADD COLUMN ${col} ${type}`);
        console.log(`Added column ${col} to form_configs_locales`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`Column ${col} already exists in form_configs_locales`);
        } else {
          console.error(`Error adding ${col} to form_configs_locales:`, err.message);
        }
      }
    }

    console.log('Database fix completed successfully');
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await client.end();
  }
}

fix();
