const { Client } = require('pg');
const fs = require('fs');

// Read migration file
const migrationContent = fs.readFileSync('./src/migrations/20251213_123245.ts', 'utf8');

// Extract SQL from the up function
const sqlMatch = migrationContent.match(/await db\.execute\(sql`([\s\S]*?)`\)/);
if (!sqlMatch) {
  console.error('Could not find SQL in migration file');
  process.exit(1);
}

const sql = sqlMatch[1];
console.log('SQL length:', sql.length);

const client = new Client({
  connectionString: 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('Connected to database');
    console.log('Running migration SQL...');
    return client.query(sql);
  })
  .then(() => {
    console.log('Migration completed successfully!');
    client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    client.end();
    process.exit(1);
  });
