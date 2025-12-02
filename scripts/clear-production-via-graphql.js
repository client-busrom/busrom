#!/usr/bin/env node

/**
 * 通过 GraphQL 清空 AWS Production 数据库
 *
 * Usage: node scripts/clear-production-via-graphql.js
 *
 * 需要先在 CMS Admin UI 登录，获取 session cookie
 */

const CMS_URL = 'https://cms.busromhouse.com/api/graphql'

// 需要设置 session cookie
const SESSION_COOKIE = process.env.CMS_SESSION_COOKIE || ''

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(CMS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function deleteAllItems(typeName, pluralName) {
  console.log(`\n🗑️  正在删除 ${typeName}...`)

  // 先查询所有 ID
  const queryResult = await graphqlRequest(`
    query {
      ${pluralName} {
        id
      }
    }
  `)

  if (queryResult.errors) {
    console.log(`  ⚠️  查询失败: ${JSON.stringify(queryResult.errors)}`)
    return 0
  }

  const items = queryResult.data?.[pluralName] || []
  if (items.length === 0) {
    console.log(`  ⏭️  已经是空的`)
    return 0
  }

  console.log(`  📊 找到 ${items.length} 条记录`)

  // 逐个删除
  let deletedCount = 0
  for (const item of items) {
    const deleteMutation = `
      mutation($id: ID!) {
        delete${typeName}(where: { id: $id }) {
          id
        }
      }
    `
    try {
      const deleteResult = await graphqlRequest(deleteMutation, { id: item.id })
      if (deleteResult.data?.[`delete${typeName}`]) {
        deletedCount++
      }
    } catch (e) {
      // ignore individual errors
    }
  }

  console.log(`  ✅ 已删除 ${deletedCount} 条记录`)
  return deletedCount
}

async function main() {
  console.log('========================================')
  console.log('  清空 AWS Production 数据库')
  console.log('========================================')

  if (!SESSION_COOKIE) {
    console.log('\n⚠️  警告: 未设置 CMS_SESSION_COOKIE')
    console.log('   请在浏览器登录 https://cms.busrom.com 后,')
    console.log('   从 Developer Tools > Application > Cookies 复制 keystonejs-session')
    console.log('   然后设置环境变量:')
    console.log('   CMS_SESSION_COOKIE="keystonejs-session=xxx" node scripts/clear-production-via-graphql.js')
    console.log('')
  }

  // 测试连接
  const testResult = await graphqlRequest('{ __typename }')
  if (testResult.errors) {
    console.log('❌ 连接测试失败')
    console.log(testResult.errors)
    return
  }
  console.log('✅ 连接成功\n')

  // 按顺序删除 (先删除依赖的表)
  const tables = [
    { type: 'Media', plural: 'mediaFiles' },
    { type: 'MediaTag', plural: 'mediaTags' },
    { type: 'MediaCategory', plural: 'mediaCategories' },
    { type: 'Product', plural: 'products' },
    { type: 'ProductSeries', plural: 'productSeriesItems' },
    { type: 'ApplicationContentTranslation', plural: 'applicationContentTranslations' },
    { type: 'Application', plural: 'applications' },
    { type: 'HeroBannerItem', plural: 'heroBannerItems' },
    { type: 'SeriesIntro', plural: 'seriesIntros' },
    { type: 'NavigationMenu', plural: 'navigationMenus' },
    { type: 'Category', plural: 'categories' },
  ]

  let totalDeleted = 0
  for (const table of tables) {
    try {
      const count = await deleteAllItems(table.type, table.plural)
      totalDeleted += count
    } catch (error) {
      console.log(`  ❌ ${table.type}: ${error.message}`)
    }
  }

  console.log('\n========================================')
  console.log(`  🎉 完成! 共删除 ${totalDeleted} 条记录`)
  console.log('========================================')
}

main().catch(console.error)
