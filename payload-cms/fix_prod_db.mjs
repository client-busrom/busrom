import pg from 'pg';
const { Client } = pg;

// AWS RDS Production Database URL - Corrected to busrom_payload
const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function fixProdDatabase() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    console.log('Connecting to AWS RDS Production Database...');
    await client.connect();
    console.log('Connected.');

    // Add missing privacy_consent_text column to form_configs_locales
    console.log('Applying schema fix: Adding privacy_consent_text to form_configs_locales...');
    const query = 'ALTER TABLE form_configs_locales ADD COLUMN IF NOT EXISTS privacy_consent_text character varying;';
    
    await client.query(query);
    console.log('✅ Success: privacy_consent_text column added to production database.');

    // Verify the change
    const verify = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'form_configs_locales' AND column_name = 'privacy_consent_text';
    `);

    if (verify.rows.length > 0) {
      console.log('Verification: Column exists.');
    } else {
      console.error('Verification failed: Column not found after ALTER.');
    }

  } catch (err) {
    console.error('❌ Error fixing production database:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('Note: This probably means the RDS instance is not reachable from your current IP (Security Group restriction).');
    }
  } finally {
    await client.end();
  }
}

fixProdDatabase();
