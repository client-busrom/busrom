#!/usr/bin/env node
/**
 * Update Media Metadata for Combination 1 (via GraphQL)
 *
 * This script:
 * 1. Connects to production CMS GraphQL API
 * 2. Counts total Media records
 * 3. Updates all Media to have combinationNumber=1 and sequential sceneNumber
 * 4. Updates tag from "单独场景图" to "场景组合图"
 */

const https = require('https')

const CMS_URL = 'https://cms.busrom.com/api/graphql'

// You need to provide a valid session cookie or API token
// For now, let's just count and show what would be updated
async function graphqlQuery(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables })

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }

    const req = https.request(CMS_URL, options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          if (json.errors) {
            reject(new Error(JSON.stringify(json.errors, null, 2)))
          } else {
            resolve(json.data)
          }
        } catch (e) {
          reject(e)
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function main() {
  console.log('🔍 Connecting to production CMS GraphQL API...')
  console.log('📊 CMS URL:', CMS_URL)

  try {
    // Step 1: Count total Media
    console.log('\n📊 Counting Media records...')
    const countQuery = `
      query {
        media: mediaCount
      }
    `

    const countData = await graphqlQuery(countQuery)
    const totalCount = countData.media

    console.log(`✅ Total Media records: ${totalCount}`)

    if (totalCount !== 88) {
      console.log(`⚠️  Warning: Expected 88 records, but found ${totalCount}`)
    }

    // Step 2: Fetch all Media
    console.log('\n📥 Fetching all Media records...')
    const mediaQuery = `
      query GetAllMedia($take: Int!) {
        media: allMedia(take: $take, orderBy: { createdAt: asc }) {
          id
          filename
          metadata
          tags {
            id
            name
          }
        }
      }
    `

    const mediaData = await graphqlQuery(mediaQuery, { take: totalCount })
    const allMedia = mediaData.media

    console.log(`✅ Fetched ${allMedia.length} Media records`)

    // Step 3: Find tags
    console.log('\n🔍 Looking for tags...')
    const tagsQuery = `
      query {
        allMediaTags {
          id
          name
        }
      }
    `

    const tagsData = await graphqlQuery(tagsQuery)
    const allTags = tagsData.allMediaTags

    const oldTag = allTags.find(t => {
      const name = typeof t.name === 'string' ? JSON.parse(t.name) : t.name
      return name.zh === '单独场景图'
    })

    const newTag = allTags.find(t => {
      const name = typeof t.name === 'string' ? JSON.parse(t.name) : t.name
      return name.zh === '场景组合图'
    })

    console.log('Old tag (单独场景图):', oldTag?.id || 'NOT FOUND')
    console.log('New tag (场景组合图):', newTag?.id || 'NOT FOUND')

    if (!newTag) {
      console.log('❌ Error: "场景组合图" tag not found!')
      console.log('\nAvailable tags:')
      allTags.forEach(t => {
        const name = typeof t.name === 'string' ? JSON.parse(t.name) : t.name
        console.log(`  - ${name.zh} (${t.id})`)
      })
      console.log('\nPlease create "场景组合图" tag first in the CMS.')
      process.exit(1)
    }

    // Step 4: Generate update mutations
    console.log('\n📝 Generating update operations...')
    console.log('\nThis would update the following:')

    for (let i = 0; i < allMedia.length; i++) {
      const media = allMedia[i]
      const sceneNumber = i + 1

      const currentMetadata = media.metadata ?
        (typeof media.metadata === 'string' ? JSON.parse(media.metadata) : media.metadata) : {}

      const newMetadata = {
        ...currentMetadata,
        combinationNumber: 1,
        sceneNumber: sceneNumber,
      }

      const hasOldTag = media.tags.some(t => t.id === oldTag?.id)
      const hasNewTag = media.tags.some(t => t.id === newTag?.id)

      if (i < 5 || i === allMedia.length - 1) {
        console.log(`\n${i + 1}. ${media.filename}`)
        console.log(`   Old metadata: ${JSON.stringify(currentMetadata)}`)
        console.log(`   New metadata: ${JSON.stringify(newMetadata)}`)
        if (hasOldTag) console.log(`   Remove tag: 单独场景图`)
        if (!hasNewTag) console.log(`   Add tag: 场景组合图`)
      } else if (i === 5) {
        console.log('\n   ... (showing first 5 and last 1)')
      }
    }

    console.log(`\n\n⚠️  This script currently only shows what would be updated.`)
    console.log(`To actually perform the updates, you need to:`)
    console.log(`1. Run this script from within the CMS with proper authentication`)
    console.log(`2. Or use direct database access`)
    console.log(`\nTotal records to update: ${allMedia.length}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
