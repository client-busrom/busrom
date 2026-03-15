import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function finalSurgery() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('--- Performing final surgery on DocumentTemplates ---');

    // 1. Rename category to category_id if needed
    console.log('Renaming category to category_id...');
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_templates' AND column_name='category') THEN
          ALTER TABLE "document_templates" RENAME COLUMN "category" TO "category_id";
        END IF;
      END $$;
    `);

    // 2. Drop name and description from main table
    console.log('Dropping name and description from main table...');
    await client.query(`
      ALTER TABLE "document_templates" DROP COLUMN IF EXISTS "name";
      ALTER TABLE "document_templates" DROP COLUMN IF EXISTS "description";
    `);

    console.log('Surgery completed successfully.');

  } catch (err) {
    console.error('Surgery failed:', err);
  } finally {
    await client.end();
  }
}

finalSurgery();
