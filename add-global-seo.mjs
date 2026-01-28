/**
 * Manually add the Global SEO setting
 */

const LOCAL_CMS_URL = 'http://localhost:3002'
const ADMIN_EMAIL = 'admin@busrom.com'
const ADMIN_PASSWORD = 'Admin123456'

async function login() {
  const response = await fetch(`${LOCAL_CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }

  const data = await response.json()
  return data.token
}

async function addGlobalSeo(token) {
  console.log('📝 Creating Global SEO setting...\n')

  const payload = {
    identifier: 'global-default',
    scope: 'global',
    metaTitle: 'One-stop OEM/ODM Glass Accessories Manufacturer — End-to-End Customized Solutions From Design To Delivery',
    metaDescription: 'Busrom specializes in glass accessory hardware, seamlessly blending functionality with elegant design. We offer customized solutions, with our core products including Glass Standoffs, Glass Connected Fittings, Glass Fence Spigots, Glass Clips, Bathroom Clamps, Glass Hinges, Sliding Door Kits, Door Handles, and Hidden Hooks. Dedicated to premium materials and craftsmanship, our team is ready to serve your needs.',
    metaKeywords: `busrom
busrom hardware
busrom hardware supplier
busrom hardware manufacturer
busrom glass hardware
busrom glass hardware supplier
busrom glass hardware manufacturer
glass clip supplier
glass standoff manufacturer
glass standoffs supplier
frameless glass spigot supplier
sliding door kit supplier
sliding door kit manufacturer
architectural glass fittings supplier
glass wall accessories​
glass standoff
standoff glass​
glass with standoffs​
glass guardrail standoffs​
glass handrail standoffs
glass standoff screws​
standoff for glass​​
glass connected fitting
glass fence spigot
retaining clip
retaining clips​
retainer clip​​
retainer clips​
guardrail glass clip
glass retainer clips​
bathroom glass clip
storm door glass retainer clips​
glass retainer piercing​
bathroom glass clamp
glass hinge
sliding door kit
sliding door hardware kit​
sliding barn door hardware kit​
sliding barn door kit with door​
sliding door kit with door​
kit sliding door​
sliding door repair kit​
sliding glass door insulation kit​
door handle
hidden hook
invisible hook
kitchen hook
retainer hook
glass bath accessories​
glass bathroom accessories
blue glass bathroom accessories​
glass bathroom accessories sets​
glass railing hardware
commercial balustrade fittings
custom stainless glass fittings
commercial glass fittings
custom glass hardware
glass fittings oem
stainless steel glass standoff
balustrade spigot wholesale
stainless steel glass hardware
framedless spigot wholesale
integrated glass fittings solutions
one-stop shop
one-stop shop solution
oem solution
odm solution
oem-odm solution`,
    ogTitle: 'Busrom Glass Retainer​ Glass Accessories Hardware Supplier',
    ogDescription: 'We are a factory producing project-grade glass hardware and accessories, offering tailored fittings and finish options for buildings, hotels, public venues, bathrooms and interior/exterior renovations, engineered for long service life.',
    ogType: 'website',
    robotsIndex: true,
    robotsFollow: true,
    canonicalUrl: 'www.busromhouse.com',
    includeInSitemap: true,
    sitemapPriority: 1.0,
    sitemapChangefreq: 'daily',
  }

  const response = await fetch(`${LOCAL_CMS_URL}/api/seo-settings`, {
    method: 'POST',
    headers: {
      'Authorization': `JWT ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create: ${response.status} - ${error}`)
  }

  const result = await response.json()
  console.log('✅ Global SEO setting created!')
  console.log(`   ID: ${result.doc.id}`)
  console.log(`   Identifier: ${result.doc.identifier}`)
  console.log(`   Title: ${result.doc.metaTitle}`)
  console.log(`   Keywords: ${result.doc.metaKeywords.split('\n').length} lines`)
}

async function verify(token) {
  console.log('\n📊 Verification...')

  const response = await fetch(`${LOCAL_CMS_URL}/api/seo-settings?where[scope][equals]=global`, {
    headers: { 'Authorization': `JWT ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to verify: ${response.status}`)
  }

  const data = await response.json()
  console.log(`   Global SEO settings count: ${data.totalDocs}`)

  if (data.totalDocs > 0) {
    data.docs.forEach(doc => {
      console.log(`   - ${doc.identifier} (Priority: ${doc.sitemapPriority})`)
    })
  }
}

async function main() {
  console.log('═'.repeat(70))
  console.log('📦 Add Global SEO Setting')
  console.log('═'.repeat(70))
  console.log()

  try {
    const token = await login()
    await addGlobalSeo(token)
    await verify(token)

    console.log('\n✅ Complete!')
    console.log('\n📝 Next: Run node test-new-seo-logic.mjs\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
