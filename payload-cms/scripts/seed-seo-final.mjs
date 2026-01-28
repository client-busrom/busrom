/**
 * Final SEO seeder with correct column names
 * Run: node scripts/seed-seo-final.mjs
 */

import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload'

const settings = [
  {
    identifier: 'home-primary-exact',
    scope: 'exact_path',
    exact_path: '/',
    meta_title: 'Busrom - Premium Glass Hardware Manufacturer | Global Leader',
    meta_description: 'Leading manufacturer of premium glass hardware products. Specializing in glass clamps, door handles, hinges and architectural hardware for global markets.',
    meta_keywords: 'glass hardware manufacturer, glass clamps supplier, premium glass fittings, stainless steel hardware, architectural glass hardware',
    og_title: 'Busrom Glass Hardware - Premium Quality Solutions',
    og_description: 'Global leader in manufacturing high-quality glass hardware products',
    robots_index: true,
    robots_follow: true,
  },
  {
    identifier: 'home-keywords-glass-clamps',
    scope: 'exact_path',
    exact_path: '/',
    meta_title: 'Glass Clamps & Standoffs | Busrom Hardware Solutions',
    meta_description: 'High-quality glass clamps, standoffs, and mounting hardware.',
    meta_keywords: 'glass clamps, glass standoffs, glass mounting hardware, glass railing clamps, glass balustrade fittings, point fixing glass, spider glass fittings, frameless glass clamps',
  },
  {
    identifier: 'home-keywords-bathroom',
    scope: 'exact_path',
    exact_path: '/',
    meta_title: 'Bathroom Hardware & Shower Accessories | Busrom',
    meta_description: 'Premium bathroom hardware including shower door hinges.',
    meta_keywords: 'bathroom hardware, shower door hinges, bathroom accessories, glass shower hardware, bathroom glass fittings, shower door handles, bathroom door hardware, shower glass clamps, frameless shower hardware',
  },
  {
    identifier: 'home-keywords-oem-odm',
    scope: 'exact_path',
    exact_path: '/',
    meta_title: 'OEM ODM Glass Hardware Factory | Custom Manufacturing',
    meta_description: 'Professional OEM ODM glass hardware manufacturing services.',
    meta_keywords: 'OEM glass hardware, ODM hardware manufacturer, custom glass fittings, glass hardware factory, wholesale glass hardware, bulk hardware supplier, hardware manufacturing, custom hardware design, contract manufacturing',
  },
  {
    identifier: 'home-keywords-materials',
    scope: 'exact_path',
    exact_path: '/',
    meta_title: 'Stainless Steel Glass Hardware | Durable Premium Quality',
    meta_description: 'Durable 304 and 316 stainless steel glass hardware.',
    meta_keywords: 'stainless steel hardware, 304 stainless steel fittings, 316 stainless steel hardware, marine grade hardware, corrosion resistant hardware, modern glass hardware, contemporary glass fittings, rust-proof hardware, weather resistant fittings',
  },
  {
    identifier: 'home-type-keywords-doors',
    scope: 'page_type',
    page_type: 'home',
    meta_title: 'Glass Door Hardware & Handles | Busrom Solutions',
    meta_description: 'Complete range of glass door hardware.',
    meta_keywords: 'glass door hardware, door handles, glass door locks, sliding door hardware, pivot door fittings, door handles stainless steel, glass door accessories, commercial door hardware, residential door hardware',
  },
  {
    identifier: 'home-type-keywords-railings',
    scope: 'page_type',
    page_type: 'home',
    meta_title: 'Glass Railing Systems & Balustrades | Busrom',
    meta_description: 'Premium glass railing systems.',
    meta_keywords: 'glass railing systems, glass balustrades, staircase glass railings, balcony glass railings, deck railing hardware, safety glass barriers, frameless glass railings, railing mounting brackets, glass handrail systems',
  },
  {
    identifier: 'home-type-keywords-connectors',
    scope: 'page_type',
    page_type: 'home',
    meta_title: 'Glass Connectors & Brackets | Structural Hardware',
    meta_description: 'Structural glass connectors and brackets.',
    meta_keywords: 'glass connectors, structural hardware, glass brackets, fixing systems, architectural brackets, glass to glass connectors, glass to wall brackets, structural glass fittings, point fixed glazing',
  },
  {
    identifier: 'home-pattern-keywords-finish',
    scope: 'path_pattern',
    path_pattern: '/*',
    meta_title: 'Polished & Brushed Finish Hardware | Busrom',
    meta_description: 'Available in mirror polished and brushed finishes.',
    meta_keywords: 'polished hardware, brushed finish hardware, mirror polish stainless steel, satin finish hardware, matte black hardware, chrome finish hardware, powder coated hardware, surface finishes, decorative hardware finishes',
  },
  {
    identifier: 'home-global-keywords-quality',
    scope: 'global',
    meta_title: 'Global Glass Hardware Supplier | Busrom Quality Assurance',
    meta_description: 'ISO certified glass hardware manufacturer.',
    meta_keywords: 'ISO certified manufacturer, quality assurance, worldwide shipping, global supplier, certified hardware, quality control, international shipping, bulk orders, wholesale pricing, factory direct',
  },
]

async function main() {
  const client = new Client({ connectionString })

  try {
    console.log('🔌 Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected!\n')

    // Delete existing
    console.log('🗑️  Deleting existing home SEO settings...')
    const deleteLocales = await client.query(`DELETE FROM seo_settings_locales WHERE _parent_id IN (SELECT id FROM seo_settings WHERE exact_path = '/' OR page_type = 'home' OR scope = 'global' OR (scope = 'path_pattern' AND path_pattern = '/*'))`)
    const deleteMain = await client.query(`DELETE FROM seo_settings WHERE exact_path = '/' OR page_type = 'home' OR scope = 'global' OR (scope = 'path_pattern' AND path_pattern = '/*')`)
    console.log(`   Deleted ${deleteMain.rowCount} settings and ${deleteLocales.rowCount} locale entries\n`)

    // Insert
    console.log('📝 Creating 10 new SEO settings...\n')
    let successCount = 0

    for (const setting of settings) {
      try {
        // Insert main record
        const mainResult = await client.query(`
          INSERT INTO seo_settings (
            identifier, scope, exact_path, page_type, path_pattern,
            robots_index, robots_follow, include_in_sitemap, sitemap_priority, sitemap_changefreq,
            updated_at, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          RETURNING id
        `, [
          setting.identifier,
          setting.scope,
          setting.exact_path || null,
          setting.page_type || null,
          setting.path_pattern || null,
          setting.robots_index !== undefined ? setting.robots_index : true,
          setting.robots_follow !== undefined ? setting.robotsFollow : true,
          true,
          0.5,
          'weekly'
        ])

        const newId = mainResult.rows[0].id

        // Insert locale data (en)
        await client.query(`
          INSERT INTO seo_settings_locales (
            _parent_id, _locale,
            meta_title, meta_description, meta_keywords,
            og_title, og_description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          newId,
          'en',
          setting.meta_title,
          setting.meta_description,
          setting.meta_keywords,
          setting.og_title || null,
          setting.og_description || null
        ])

        console.log(`✅ [${successCount+1}/10] Created: ${setting.identifier}`)
        console.log(`   Scope: ${setting.scope}, ID: ${newId}, Keywords: ${setting.meta_keywords.split(',').length}`)
        successCount++
      } catch (err) {
        console.log(`❌ Failed: ${setting.identifier} - ${err.message}`)
      }
    }

    console.log('\n' + '═'.repeat(70))
    console.log(`📊 SUMMARY: ${successCount}/10 created successfully!`)
    console.log('═'.repeat(70))

    // Verify
    console.log('\n🔍 Verifying inserted data...\n')
    const result = await client.query(`
      SELECT s.id, s.identifier, s.scope, s.exact_path, s.page_type, l.meta_title
      FROM seo_settings s
      LEFT JOIN seo_settings_locales l ON s.id = l._parent_id AND l._locale = 'en'
      WHERE s.identifier LIKE 'home-%'
      ORDER BY
        CASE s.scope
          WHEN 'exact_path' THEN 4
          WHEN 'path_pattern' THEN 3
          WHEN 'page_type' THEN 2
          WHEN 'global' THEN 1
        END DESC,
        s.identifier
    `)

    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.identifier} (ID: ${row.id})`)
      console.log(`   Scope: ${row.scope}${row.exact_path ? ` (${row.exact_path})` : ''}${row.page_type ? ` (${row.page_type})` : ''}`)
      console.log(`   Title: ${row.meta_title}`)
    })

    console.log('\n✅ All done! Now test:')
    console.log('   1. Visit: http://localhost:3000/en')
    console.log('   2. Right-click → View Page Source')
    console.log('   3. Search for:')
    console.log('      ✓ <title>Busrom - Premium Glass Hardware Manufacturer')
    console.log('      ✓ <div class="seo-hidden">  (should have 4 hidden titles from #2-5)')
    console.log('      ✓ <style>:root { --seo-header:  (CSS variables with keywords)')
    console.log('      ✓ <span data-seo-zone="header"></span>  (5 zone markers)')

  } catch (err) {
    console.error('\n❌ Error:', err.message)
    console.error(err.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
