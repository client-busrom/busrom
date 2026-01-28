/**
 * Import SEO Settings to Local Database
 * 1. Clears existing local SEO settings
 * 2. Imports production SEO settings
 */

import fs from 'fs'
import pg from 'pg'

const { Client } = pg

const INPUT_FILE = './prod-seo-settings.json'
const LOCAL_DB_URL = 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload'

async function importSeoToLocal() {
  console.log('📦 Importing SEO Settings to Local Database\n')

  // Read exported data
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Error: ${INPUT_FILE} not found!`)
    console.log(`   Run: node export-prod-seo.mjs first`)
    process.exit(1)
  }

  const prodSettings = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'))
  console.log(`   ✅ Loaded ${prodSettings.length} SEO settings from ${INPUT_FILE}\n`)

  const client = new Client({ connectionString: LOCAL_DB_URL })

  try {
    await client.connect()
    console.log('   🔌 Connected to local database\n')

    // Step 1: Clear existing SEO settings
    console.log('🗑️  Clearing existing SEO settings...')
    const deleteResult = await client.query('DELETE FROM seo_settings')
    console.log(`   ✅ Deleted ${deleteResult.rowCount} existing records\n`)

    // Step 2: Insert production settings
    console.log('📥 Importing production SEO settings...')

    let insertCount = 0
    for (const setting of prodSettings) {
      try {
        // Prepare values
        const values = [
          setting.identifier,
          setting.scope,
          setting.pageType || null,
          setting.exactPath || null,
          setting.pathPattern || null,
          setting.metaTitle || null,
          setting.metaDescription || null,
          setting.metaKeywords || null,
          setting.ogTitle || null,
          setting.ogDescription || null,
          setting.ogImage?.id || null,
          setting.ogType || 'website',
          setting.robotsIndex ?? true,
          setting.robotsFollow ?? true,
          setting.canonicalUrl || null,
          setting.includeInSitemap ?? true,
          setting.sitemapPriority ?? 0.5,
          setting.sitemapChangefreq || 'weekly',
          new Date(), // created_at
          new Date(), // updated_at
        ]

        await client.query(`
          INSERT INTO seo_settings (
            identifier, scope, page_type, exact_path, path_pattern,
            meta_title, meta_description, meta_keywords,
            og_title, og_description, og_image_id, og_type,
            robots_index, robots_follow, canonical_url,
            include_in_sitemap, sitemap_priority, sitemap_changefreq,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17, $18, $19, $20
          )
        `, values)

        insertCount++
        process.stdout.write(`\r   Imported: ${insertCount}/${prodSettings.length}`)
      } catch (err) {
        console.error(`\n   ⚠️  Failed to import ${setting.identifier}:`, err.message)
      }
    }

    console.log(`\n   ✅ Successfully imported ${insertCount} SEO settings\n`)

    // Step 3: Verify
    const countResult = await client.query('SELECT COUNT(*) FROM seo_settings')
    console.log(`📊 Verification:`)
    console.log(`   Total SEO settings in local DB: ${countResult.rows[0].count}\n`)

    // Show breakdown by scope
    const scopeResult = await client.query(`
      SELECT scope, COUNT(*) as count
      FROM seo_settings
      GROUP BY scope
      ORDER BY count DESC
    `)

    console.log(`   By scope:`)
    scopeResult.rows.forEach(row => {
      console.log(`   - ${row.scope}: ${row.count}`)
    })

    console.log(`\n✅ Import complete!`)

  } catch (error) {
    console.error('\n❌ Database error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

importSeoToLocal()
