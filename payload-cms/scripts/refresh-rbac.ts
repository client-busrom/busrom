import { getPayload } from 'payload'
import config from '../payload.config'
import { seedPermissionsSystem } from '../src/seed/seed-permissions-system'

const refresh = async () => {
  console.log('🚀 Triggering RBAC Permissions Refresh...')
  const payload = await getPayload({ config })
  await seedPermissionsSystem(payload)
  console.log('✅ RBAC Synchronization Complete.')
  process.exit(0)
}

refresh().catch((err) => {
  console.error('❌ Failed to refresh RBAC:', err)
  process.exit(1)
})
