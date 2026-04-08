import pg from 'pg';
const { Client } = pg;

// AWS RDS Production Database URL
const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function fixFormSubmissions() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    console.log('Connecting to AWS RDS Production Database...');
    await client.connect();
    console.log('Connected.');

    // Add missing user_local_time column
    console.log('Applying schema fix: Adding user_local_time to form_submissions...');
    await client.query('ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS user_local_time TEXT;');
    
    // Add missing china_time column
    console.log('Applying schema fix: Adding china_time to form_submissions...');
    await client.query('ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS china_time TEXT;');
    
    console.log('✅ Success: Columns added to production database.');

    // Verify the change
    const verify = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'form_submissions' AND column_name IN ('user_local_time', 'china_time');
    `);

    console.log('Verification: Columns found in DB:', verify.rows.map(r => r.column_name));

  } catch (err) {
    console.error('❌ Error fixing form_submissions table:', err.message);
  } finally {
    await client.end();
  }
}

fixFormSubmissions();
