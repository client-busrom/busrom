import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function checkColumn(tableName, columnName) {
  const res = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = $1 
      AND column_name = $2
    );
  `, [tableName, columnName])
  return res.rows[0].exists
}

async function run() {
  await client.connect()
  console.log('Connected to production RDS for cleanup')

  // 1. Drop SystemNotifications tables
  console.log('Dropping system_notifications tables...')
  await client.query('DROP TABLE IF EXISTS "system_notifications_locales" CASCADE')
  await client.query('DROP TABLE IF EXISTS "system_notifications" CASCADE')
  console.log('✅ Dropped system_notifications and locales tables')

  // 2. Remove system_notifications_id from locked docs rels
  console.log('Cleaning up payload_locked_documents_rels...')
  if (await checkColumn('payload_locked_documents_rels', 'system_notifications_id')) {
    await client.query('ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "system_notifications_id"')
    console.log('✅ Removed system_notifications_id column')
  }

  console.log('\n🎉 Obsolete SystemNotifications cleanup completed!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
