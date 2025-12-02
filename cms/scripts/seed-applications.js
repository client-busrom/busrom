/**
 * Seed Applications - exported for use in seed-home-content.js
 */

const applicationTemplates = require('./seed-data/applications-template.json')

async function seedApplications(graphqlRequest, placeholderMediaId) {
  console.log('\n📋 Seeding Applications (10 items)...')

  // Get APPLICATION categories
  const categoriesQuery = `
    query {
      categories(where: { type: { equals: "APPLICATION" } }, orderBy: { order: asc }) {
        id
        slug
        name
      }
    }
  `
  const categoriesData = await graphqlRequest(categoriesQuery)
  const categories = categoriesData.categories || []

  if (categories.length === 0) {
    console.log('⚠️  No APPLICATION categories found!')
    console.log('⚠️  Please run: node scripts/seed-home-content.js --module applicationCategories')
    return 0
  }

  console.log(`  Found ${categories.length} APPLICATION categories`)

  let created = 0

  for (const category of categories) {
    const templateData = applicationTemplates[category.slug]
    if (!templateData) {
      console.log(`  ⚠️  No template data for ${category.slug}, skipping...`)
      continue
    }

    // Create Application
    const createMutation = `
      mutation CreateApplication($data: ApplicationCreateInput!) {
        createApplication(data: $data) {
          id
          slug
          name
        }
      }
    `

    const applicationData = {
      slug: `${category.slug}-case-${Date.now()}`,
      name: {
        en: templateData.en.name,
        zh: templateData.zh.name
      },
      shortDescription: {
        en: templateData.en.shortDescription,
        zh: templateData.zh.shortDescription
      },
      description: {
        en: templateData.en.description,
        zh: templateData.zh.description
      },
      mainImage: placeholderMediaId,
      images: [placeholderMediaId, placeholderMediaId, placeholderMediaId],
      category: { connect: { id: category.id } },
      status: 'PUBLISHED'
    }

    try {
      const result = await graphqlRequest(createMutation, { data: applicationData })
      const applicationId = result.createApplication.id
      console.log(`  ✅ ${created + 1}/${categories.length}: ${templateData.en.name} (ID: ${applicationId})`)

      // Create ApplicationContentTranslation for EN and ZH
      const createTranslationMutation = `
        mutation CreateTranslation($data: ApplicationContentTranslationCreateInput!) {
          createApplicationContentTranslation(data: $data) {
            id
            locale
          }
        }
      `

      // EN translation
      const enContent = [
        { type: 'heading', level: 2, children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: templateData.en.description }] },
        { type: 'heading', level: 2, children: [{ text: 'Key Features' }] },
        { type: 'paragraph', children: [{ text: 'This project showcases the versatility and quality of our products in real-world applications.' }] },
      ]

      try {
        await graphqlRequest(createTranslationMutation, {
          data: {
            locale: 'en',
            content: enContent,
            application: { connect: { id: applicationId } }
          }
        })
        console.log(`    ✅ Created EN translation`)
      } catch (error) {
        console.error(`    ⚠️  Failed to create EN translation:`, error.message)
      }

      // ZH translation
      const zhContent = [
        { type: 'heading', level: 2, children: [{ text: '项目概览' }] },
        { type: 'paragraph', children: [{ text: templateData.zh.description }] },
        { type: 'heading', level: 2, children: [{ text: '主要特点' }] },
        { type: 'paragraph', children: [{ text: '该项目展示了我们产品在实际应用中的多功能性和高品质。' }] },
      ]

      try {
        await graphqlRequest(createTranslationMutation, {
          data: {
            locale: 'zh',
            content: zhContent,
            application: { connect: { id: applicationId } }
          }
        })
        console.log(`    ✅ Created ZH translation`)
      } catch (error) {
        console.error(`    ⚠️  Failed to create ZH translation:`, error.message)
      }

      created++
    } catch (error) {
      console.error(`  ❌ Failed: ${templateData.en.name}`, error.message)
    }
  }

  return created
}

module.exports = { seedApplications }
