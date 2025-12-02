/**
 * Test GraphQL Query
 *
 * 测试 GraphQL 查询
 */

async function main() {
  const standoffTagId = '75a8b341-2048-459a-b148-7518afdcc173'
  const sceneCategoryId = 'ef23fc47-aac1-4652-ab76-f8bcafd7624a'

  const query = `
    query {
      media(
        where: {
          AND: [
            { tags: { some: { id: { equals: "${standoffTagId}" } } } }
            { primaryCategory: { id: { equals: "${sceneCategoryId}" } } }
          ]
        }
      ) {
        id
        filename
      }
      mediaCount(
        where: {
          AND: [
            { tags: { some: { id: { equals: "${standoffTagId}" } } } }
            { primaryCategory: { id: { equals: "${sceneCategoryId}" } } }
          ]
        }
      )
    }
  `

  console.log('🔍 测试 GraphQL 查询...\n')
  console.log('查询条件:')
  console.log(`  标签ID: ${standoffTagId}`)
  console.log(`  分类ID: ${sceneCategoryId}\n`)

  try {
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      console.log(`❌ HTTP 错误: ${response.status} ${response.statusText}`)
      return
    }

    const result = await response.json()

    if (result.errors) {
      console.log('❌ GraphQL 错误:')
      console.log(JSON.stringify(result.errors, null, 2))
      return
    }

    console.log(`✅ GraphQL 返回结果:`)
    console.log(`   mediaCount: ${result.data.mediaCount}`)
    console.log(`   media 数组长度: ${result.data.media.length}`)

    if (result.data.media.length > 0) {
      console.log('\n   前5个文件:')
      result.data.media.slice(0, 5).forEach((m: any) => {
        console.log(`     - ${m.filename}`)
      })
    }

    if (result.data.mediaCount === 146) {
      console.log('\n🎉 GraphQL 查询返回正确的数量！')
    } else {
      console.log(`\n⚠️  预期 146，实际返回 ${result.data.mediaCount}`)
    }

  } catch (error: any) {
    console.log('❌ 请求失败:', error.message)
    console.log('请确保 Keystone CMS 正在运行在 http://localhost:3000')
  }
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
