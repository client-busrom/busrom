
const API_BASE = 'https://cms.busromhouse.com/api'
const EMAIL = 'admin@busrom.com'
const PASSWORD = 'Admin123456'

const format = (val) =>
  val
    .replace(/ /g, '-')           // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')      // Remove all non-word characters except hyphens
    .toLowerCase()               // Convert to lowercase
    .replace(/-+/g, '-')          // Collapse multiple consecutive hyphens
    .replace(/^-+|-+$/g, '')      // Remove leading and trailing hyphens

async function migrate() {
  console.log('🚀 Starting Blogs collection migration...')

  // 1. Login
  const loginRes = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  })

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.statusText}`)
  }

  const { token } = await loginRes.json()
  console.log('✅ Logged in successfully')

  const headers = {
    'Authorization': `JWT ${token}`,
    'Content-Type': 'application/json'
  }

  // 2. Fetch Blogs
  // We'll fetch multiple pages if needed, but start with a high limit
  const blogsRes = await fetch(`${API_BASE}/blogs?limit=500&depth=0`, { headers })
  if (!blogsRes.ok) {
    throw new Error(`Failed to fetch blogs: ${blogsRes.statusText}`)
  }

  const { docs } = await blogsRes.json()
  console.log(`📦 Found ${docs.length} blogs to process`)

  // 3. Process each blog
  for (const doc of docs) {
    const oldSlug = doc.slug
    const newAdminLabel = oldSlug
    const newSlug = format(oldSlug)

    console.log(`🔄 Processing [${doc.id}]: "${oldSlug}" -> Admin: "${newAdminLabel}", Slug: "${newSlug}"`)

    const updateRes = await fetch(`${API_BASE}/blogs/${doc.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        adminLabel: newAdminLabel,
        slug: newSlug
      })
    })

    if (updateRes.ok) {
      console.log(`   ✅ Updated [${doc.id}]`)
    } else {
      const errData = await updateRes.json()
      console.error(`   ❌ Failed to update [${doc.id}]:`, JSON.stringify(errData))
    }
  }

  console.log('🎉 Migration finished!')
}

migrate().catch(err => {
  console.error('💥 Migration error:', err.message)
  process.exit(1)
})
