import pg from 'pg';

const DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function fixEnum() {
  const client = new pg.Client({ connectionString: DB_URL });
  try {
    await client.connect();
    console.log('Connected to RDS.');

    // 1. Check current values of the enum
    console.log('Checking enum values...');
    const res = await client.query(`
      SELECT e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'enum_form_configs_fields_field_type'
    `);
    
    const existingValues = res.rows.map(r => r.enumlabel);
    console.log('Existing values:', existingValues);

    if (!existingValues.includes('country')) {
      console.log('Adding "country" to enum_form_configs_fields_field_type...');
      // Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in older PG, 
      // but pg client by default doesn't start a transaction unless we ask.
      await client.query(`ALTER TYPE enum_form_configs_fields_field_type ADD VALUE 'country'`);
      console.log('✅ Success: country added to fieldType enum.');
    } else {
      console.log('ℹ️  "country" already exists in enum.');
    }

  } catch (err) {
    console.error('Error fixing enum:', err.message);
  } finally {
    await client.end();
  }
}

fixEnum();
