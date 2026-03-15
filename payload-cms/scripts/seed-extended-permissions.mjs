import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

const NEW_RESOURCES = [
  'SERIES_INTRO_ITEM',
  'SYSTEM_NOTIFICATION',
  'PRODUCT_ATTRIBUTE',
  'PRODUCT_TEMPLATE',
  'SERIES_TEMPLATE',
  'PRODUCT_REUSABLE_BLOCK',
  'SERIES_REUSABLE_BLOCK'
]

async function run() {
  await client.connect()
  console.log('Connected to production RDS')

  // 1. Add new resources to enum
  for (const resource of NEW_RESOURCES) {
    try {
      await client.query(`ALTER TYPE enum_permissions_resource ADD VALUE '${resource}'`)
      console.log(`✅ Added ${resource} to enum_permissions_resource`)
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log(`⊙ ${resource} already exists in enum`)
      } else {
        console.error(`❌ Error adding ${resource}:`, e.message)
      }
    }
  }

  // 2. Seed basic CRUD permissions for each new resource
  console.log('\nSeeding permissions...')
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE']
  
  // Get super_admin role ID
  const roleRes = await client.query("SELECT id FROM roles WHERE code = 'super_admin'")
  const superAdminId = roleRes.rows[0]?.id

  for (const resource of NEW_RESOURCES) {
    for (const action of actions) {
      const identifier = `${resource}_${action}`
      
      // Check if permission exists
      const permCheck = await client.query('SELECT id FROM permissions WHERE identifier = $1', [identifier])
      let permId
      
      if (permCheck.rows.length === 0) {
        const insertRes = await client.query(`
          INSERT INTO permissions (resource, action, identifier, category, description, is_system, created_at, updated_at)
          VALUES ($1, $2, $3, 'CONTENT', $3, true, now(), now())
          RETURNING id
        `, [resource, action, identifier])
        permId = insertRes.rows[0].id
        console.log(`✅ Created permission: ${identifier}`)
      } else {
        permId = permCheck.rows[0].id
      }

      // Link to super_admin if not already linked
      if (superAdminId && permId) {
        const linkCheck = await client.query('SELECT 1 FROM roles_rels WHERE parent_id = $1 AND permissions_id = $2', [superAdminId, permId])
        if (linkCheck.rows.length === 0) {
          await client.query('INSERT INTO roles_rels (parent_id, permissions_id, path) VALUES ($1, $2, \'permissions\')', [superAdminId, permId])
          console.log(`🔗 Linked ${identifier} to super_admin`)
        }
      }
    }
  }

  console.log('\n🎉 Extended permissions seeding completed!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
