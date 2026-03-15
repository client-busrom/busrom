import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function fixProductionSchema() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    console.log('Connecting to production database...');
    await client.connect();
    console.log('Connected successfully.');

    console.log('Applying schema fixes...');

    // 1. Fix site_config table
    const siteConfigQuery = `
      ALTER TABLE "site_config" 
      ADD COLUMN IF NOT EXISTS "turnstile_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "turnstile_site_key" text,
      ADD COLUMN IF NOT EXISTS "turnstile_secret_key" text,
      ADD COLUMN IF NOT EXISTS "turnstile_threshold" numeric DEFAULT 2,
      ADD COLUMN IF NOT EXISTS "cloudfront_distribution_id" text,
      ADD COLUMN IF NOT EXISTS "frontend_url" text,
      ADD COLUMN IF NOT EXISTS "revalidate_secret" text;
    `;
    
    console.log('Updating site_config table...');
    await client.query(siteConfigQuery);
    console.log('site_config table updated.');

    // 2. Fix products_locales table
    const productsLocalesQuery = `
      ALTER TABLE "products_locales" 
      ADD COLUMN IF NOT EXISTS "product_attributes" jsonb;
    `;

    console.log('Updating products_locales table...');
    await client.query(productsLocalesQuery);
    console.log('products_locales table updated.');

    console.log('Checking result for site_config:');
    const siteConfigCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'site_config' 
      AND column_name IN ('cloudfront_distribution_id', 'turnstile_enabled');
    `);
    console.log(siteConfigCheck.rows);

    console.log('Checking result for products_locales:');
    const productsLocalesCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products_locales' 
      AND column_name = 'product_attributes';
    `);
    console.log(productsLocalesCheck.rows);

  } catch (err) {
    console.error('Error fixing production schema:', err);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

fixProductionSchema();
