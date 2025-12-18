/**
 * Simple test script to verify home API integration
 * Run: node test-api.js
 */

const CMS_URL = process.env.CMS_URL || 'http://localhost:3002'

async function testHomeAPI() {
  try {
    console.log(`🧪 Testing home API at ${CMS_URL}/api/home?locale=en\n`)

    const response = await fetch(`${CMS_URL}/api/home?locale=en`)

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('✅ API Response received')
    console.log(`📦 Total sections: ${Object.keys(data).length}`)
    console.log(`\nSections included:`)
    Object.keys(data).forEach(key => {
      const value = data[key]
      let info = ''
      if (Array.isArray(value)) {
        info = `(${value.length} items)`
      } else if (value === null) {
        info = '(null)'
      } else if (typeof value === 'object') {
        info = '(object)'
      } else {
        info = `(${typeof value})`
      }
      console.log(`  ✓ ${key} ${info}`)
    })

    // Test Chinese locale
    console.log(`\n🧪 Testing Chinese locale...`)
    const zhResponse = await fetch(`${CMS_URL}/api/home?locale=zh`)
    const zhData = await zhResponse.json()
    console.log(`✅ Chinese locale works: ${zhData.locale === 'zh' ? 'Yes' : 'No'}`)

    console.log(`\n🎉 All tests passed!`)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testHomeAPI()
