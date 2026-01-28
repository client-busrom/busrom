/**
 * Direct PostgreSQL insert for SEO settings
 * Run: node scripts/seed-seo-pg.mjs
 */

import pg from 'pg'
const { Client } = pg

const connectionString = process.env.DATABASE_URI || 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload'

const settings = [
  {
    identifier: 'home-primary-exact',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Busrom - Premium Glass Hardware Manufacturer | Global Leader',
    metaDescription: 'Leading manufacturer of premium glass hardware products. Specializing in glass clamps, door handles, hinges and architectural hardware for global markets.',
    metaKeywords: 'glass hardware manufacturer, glass clamps supplier, premium glass fittings, stainless steel hardware, architectural glass hardware',
    ogTitle: 'Busrom Glass Hardware - Premium Quality Solutions',
    ogDescription: 'Global leader in manufacturing high-quality glass hardware products',
    robotsIndex: true,
    robotsFollow: true,
  },
  {
    identifier: 'home-keywords-glass-clamps',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Glass Clamps & Standoffs | Busrom Hardware Solutions',
    metaDescription: 'High-quality glass clamps, standoffs, and mounting hardware.',
    metaKeywords: 'glass clamps, glass standoffs, glass mounting hardware, glass railing clamps, glass balustrade fittings, point fixing glass, spider glass fittings, frameless glass clamps',
  },
  {
    identifier: 'home-keywords-bathroom',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Bathroom Hardware & Shower Accessories | Busrom',
    metaDescription: 'Premium bathroom hardware including shower door hinges, handles, and glass accessories.',
    metaKeywords: 'bathroom hardware, shower door hinges, bathroom accessories, glass shower hardware, bathroom glass fittings, shower door handles, bathroom door hardware, shower glass clamps, frameless shower hardware',
  },
  {
    identifier: 'home-keywords-oem-odm',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'OEM ODM Glass Hardware Factory | Custom Manufacturing',
    metaDescription: 'Professional OEM ODM glass hardware manufacturing services.',
    metaKeywords: 'OEM glass hardware, ODM hardware manufacturer, custom glass fittings, glass hardware factory, wholesale glass hardware, bulk hardware supplier, hardware manufacturing, custom hardware design, contract manufacturing',
  },
  {
    identifier: 'home-keywords-materials',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Stainless Steel Glass Hardware | Durable Premium Quality',
    metaDescription: 'Durable 304 and 316 stainless steel glass hardware.',
    metaKeywords: 'stainless steel hardware, 304 stainless steel fittings, 316 stainless steel hardware, marine grade hardware, corrosion resistant hardware, modern glass hardware, contemporary glass fittings, rust-proof hardware, weather resistant fittings',
  },
  {
    identifier: 'home-type-keywords-doors',
    scope: 'page_type',
    pageType: 'home',
    metaTitle: 'Glass Door Hardware & Handles | Busrom Solutions',
    metaDescription: 'Complete range of glass door hardware.',
    metaKeywords: 'glass door hardware, door handles, glass door locks, sliding door hardware, pivot door fittings, door handles stainless steel, glass door accessories, commercial door hardware, residential door hardware',
  },
  {
    identifier: 'home-type-keywords-railings',
    scope: 'page_type',
    pageType: 'home',
    metaTitle: 'Glass Railing Systems & Balustrades | Busrom',
    metaDescription: 'Premium glass railing systems.',
    metaKeywords: 'glass railing systems, glass balustrades, staircase glass railings, balcony glass railings, deck railing hardware, safety glass barriers, frameless glass railings, railing mounting brackets, glass handrail systems',
  },
  {
    identifier: 'home-type-keywords-connectors',
    scope: 'page_type',
    pageType: 'home',
    metaTitle: 'Glass Connectors & Brackets | Structural Hardware',
    metaDescription: 'Structural glass connectors and brackets.',
    metaKeywords: 'glass connectors, structural hardware, glass brackets, fixing systems, architectural brackets, glass to glass connectors, glass to wall brackets, structural glass fittings, point fixed glazing',
  },
  {
    identifier: 'home-pattern-keywords-finish',
    scope: 'path_pattern',
    pathPattern: '/*',
    metaTitle: 'Polished & Brushed Finish Hardware | Busrom',
    metaDescription: 'Available in mirror polished and brushed finishes.',
    metaKeywords: 'polished hardware, brushed finish hardware, mirror polish stainless steel, satin finish hardware, matte black hardware, chrome finish hardware, powder coated hardware, surface finishes, decorative hardware finishes',
  },
  {
    identifier: 'home-global-keywords-quality',
    scope: 'global',
    metaTitle: 'Global Glass Hardware Supplier | Busrom Quality Assurance',
    metaDescription: 'ISO certified glass hardware manufacturer.',
    metaKeywords: 'ISO certified manufacturer, quality assurance, worldwide shipping, global supplier, certified hardware, quality control, international shipping, bulk orders, wholesale pricing, factory direct',
  },
]

async function main() {
  const client = new Client({ connectionString })

  try {
    console.log('🔌 Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected!\n')

    // Delete existing home SEO settings
    console.log('🗑️  Deleting existing home SEO settings...')
    const deleteResult = await client.query(`
      DELETE FROM seo_settings
      WHERE "exactPath" = '/'
         OR "pageType" = 'home'
         OR scope = 'global'
         OR (scope = 'path_pattern' AND "pathPattern" = '/*')
    `)
    console.log(`   Deleted ${deleteResult.rowCount} existing settings\n`)

    // Insert new settings
    console.log('📝 Creating 10 new SEO settings...\n')
    let successCount = 0

    for (const setting of settings) {
      try {
        await client.query(`
          INSERT INTO seo_settings (
            identifier, scope, "exactPath", "pageType", "pathPattern",
            "metaTitle", "metaDescription", "metaKeywords",
            "ogTitle", "ogDescription", "robotsIndex", "robotsFollow",
            "includeInSitemap", "sitemapPriority", "sitemapChangefreq",
            "updatedAt", "createdAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        `, [
          setting.identifier,
          setting.scope,
          setting.exactPath || null,
          setting.pageType || null,
          setting.pathPattern || null,
          setting.metaTitle,
          setting.metaDescription,
          setting.metaKeywords,
          setting.ogTitle || null,
          setting.ogDescription || null,
          setting.robotsIndex !== undefined ? setting.robotsIndex : true,
          setting.robotsFollow !== undefined ? setting.robotsFollow : true,
          true,
          0.5,
          'weekly'
        ])

        console.log(`✅ Created: ${setting.identifier}`)
        console.log(`   Scope: ${setting.scope}, Keywords: ${setting.metaKeywords.split(',').length}`)
        successCount++
      } catch (err) {
        console.log(`❌ Failed: ${setting.identifier} - ${err.message}`)
      }
    }

    console.log('\n' + '═'.repeat(70))
    console.log(`📊 SUMMARY: ${successCount}/10 created successfully`)
    console.log('═'.repeat(70))

    // Verify
    console.log('\n🔍 Verifying inserted data...\n')
    const result = await client.query(`
      SELECT identifier, scope, "exactPath", "pageType", "metaTitle"
      FROM seo_settings
      WHERE identifier LIKE 'home-%'
      ORDER BY
        CASE scope
          WHEN 'exact_path' THEN 4
          WHEN 'path_pattern' THEN 3
          WHEN 'page_type' THEN 2
          WHEN 'global' THEN 1
        END DESC,
        identifier
    `)

    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.identifier}`)
      console.log(`   Scope: ${row.scope}${row.exactPath ? ` (${row.exactPath})` : ''}${row.pageType ? ` (${row.pageType})` : ''}`)
      console.log(`   Title: ${row.metaTitle}`)
    })

    console.log('\n✅ All done! Now test the homepage:')
    console.log('   1. Visit: http://localhost:3000/en')
    console.log('   2. View Page Source')
    console.log('   3. Search for:')
    console.log('      • <title>Busrom - Premium Glass Hardware Manufacturer')
    console.log('      • <div class="seo-hidden">')
    console.log('      • <style>:root { --seo-header:')
    console.log('      • <span data-seo-zone="header"></span>')

  } catch (err) {
    console.error('❌ Error:', err.message)
    console.error(err.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
