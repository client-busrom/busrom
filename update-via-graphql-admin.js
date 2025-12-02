#!/usr/bin/env node
/**
 * Update Media Metadata via CMS GraphQL API
 *
 * This script uses the admin GraphQL API mutation to batch update Media records.
 * It's safer than direct database access and goes through Keystone's hooks.
 *
 * Usage:
 *   node update-via-graphql-admin.js
 */

const https = require('https')

const CMS_URL = 'https://cms.busrom.com/api/graphql'

// You'll need to get a valid session cookie from the browser
// Open Chrome DevTools -> Application -> Cookies -> find keystonejs-session
const SESSION_COOKIE = process.env.SESSION_COOKIE || ''

async function graphqlMutation(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables })

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    }

    if (SESSION_COOKIE) {
      headers['Cookie'] = `keystonejs-session=${SESSION_COOKIE}`
    }

    const options = {
      method: 'POST',
      headers,
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
  console.log('🔍 Connecting to CMS GraphQL API...')
  console.log('📊 CMS URL:', CMS_URL)

  if (!SESSION_COOKIE) {
    console.log('\n⚠️  No SESSION_COOKIE provided!')
    console.log('To get your session cookie:')
    console.log('1. Open https://cms.busrom.com in Chrome')
    console.log('2. Log in if not already logged in')
    console.log('3. Open DevTools (F12) -> Application -> Cookies')
    console.log('4. Find "keystonejs-session" cookie and copy its value')
    console.log('5. Run: SESSION_COOKIE="<value>" node update-via-graphql-admin.js')
    console.log('\nTrying without authentication (will likely fail)...\n')
  }

  try {
    // Step 1: Count Media
    console.log('\n📊 Counting Media records...')
    const countQuery = `
      query {
        mediaCount
      }
    `
    const countData = await graphqlMutation(countQuery)
    const totalCount = countData.mediaCount

    console.log(`✅ Total Media records: ${totalCount}`)

    if (totalCount !== 88) {
      console.log(`⚠️  Warning: Expected 88 records, but found ${totalCount}`)
      console.log('Continue anyway in 5 seconds... (Ctrl+C to cancel)')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    // Step 2: Fetch all Media
    console.log('\n📥 Fetching all Media records...')
    const mediaQuery = `
      query GetAllMedia($take: Int!) {
        media(take: $take, orderBy: { createdAt: asc }) {
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

    const mediaData = await graphqlMutation(mediaQuery, { take: totalCount })
    const allMedia = mediaData.media

    console.log(`✅ Fetched ${allMedia.length} Media records`)

    // Step 3: Find tags
    console.log('\n🔍 Looking for tags...')
    const tagsQuery = `
      query {
        mediaTags {
          id
          name
        }
      }
    `

    const tagsData = await graphqlMutation(tagsQuery)
    const allTags = tagsData.mediaTags

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
      console.log('\n⚠️  Warning: "场景组合图" tag not found!')
      console.log('Will update metadata only (not tags)')
    }

    // Step 4: Update each Media
    console.log('\n🔄 Updating Media records...')
    let updateCount = 0

    const updateMutation = `
      mutation UpdateMedia($id: ID!, $data: MediaUpdateInput!) {
        updateMedia(where: { id: $id }, data: $data) {
          id
          filename
        }
      }
    `

    for (let i = 0; i < allMedia.length; i++) {
      const media = allMedia[i]
      const sceneNumber = i + 1

      // Parse current metadata
      const currentMetadata = media.metadata ?
        (typeof media.metadata === 'string' ? JSON.parse(media.metadata) : media.metadata) : {}

      // Prepare new metadata
      const newMetadata = {
        ...currentMetadata,
        combinationNumber: 1,
        sceneNumber: sceneNumber,
      }

      // Prepare tag updates
      const updateData = {
        metadata: newMetadata,
      }

      // Handle tag updates if both tags exist
      if (oldTag && newTag) {
        const hasOldTag = media.tags.some(t => t.id === oldTag.id)
        const hasNewTag = media.tags.some(t => t.id === newTag.id)

        if (hasOldTag) {
          const otherTags = media.tags.filter(t => t.id !== oldTag.id)
          const tagIds = hasNewTag
            ? otherTags.map(t => ({ id: t.id }))
            : [...otherTags.map(t => ({ id: t.id })), { id: newTag.id }]

          updateData.tags = { set: tagIds }
        }
      }

      // Execute update
      await graphqlMutation(updateMutation, {
        id: media.id,
        data: updateData,
      })

      updateCount++
      if (updateCount % 10 === 0) {
        console.log(`  Updated ${updateCount}/${allMedia.length} records...`)
      }
    }

    console.log(`\n✅ Successfully updated ${updateCount} Media records!`)
    console.log('\n📋 Summary:')
    console.log(`  - All Media now have: combinationNumber = 1`)
    console.log(`  - Scene numbers: 1 to ${allMedia.length}`)
    if (oldTag && newTag) {
      console.log(`  - Tag updated: "单独场景图" → "场景组合图"`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('Access denied')) {
      console.log('\n💡 This error means you need to provide a valid SESSION_COOKIE')
      console.log('See instructions above on how to get it.')
    }
    process.exit(1)
  }
}

main()
