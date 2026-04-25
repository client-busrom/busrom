import { getPayload } from 'payload'
import config from '../../payload.config'

async function debugAPI() {
  const payload = await getPayload({ config })
  
  // Find products with attributePage
  const productsResult = await payload.find({
    collection: 'products',
    depth: 2,
    limit: 5,
    locale: 'en', // TEST WITH LOCALE
    where: {
      status: { equals: 'published' }
    }
  })
  
  console.log(`Found ${productsResult.docs.length} products`)
  
  productsResult.docs.forEach((product: any) => {
    console.log(`\n--- Product: ${product.name} (ID: ${product.id}) ---`)
    console.log(`attributePage: ${product.attributePage ? 'EXISTS' : 'MISSING'}`)
    if (product.attributePage) {
      console.log(`attributePage Name: ${product.attributePage.name}`)
      console.log(`productAttributes Type: ${typeof product.attributePage.productAttributes}`)
      console.log(`productAttributes isArray: ${Array.isArray(product.attributePage.productAttributes)}`)
      console.log(`productAttributes keys: ${product.attributePage.productAttributes ? Object.keys(product.attributePage.productAttributes) : 'null'}`)
      
      const attrs = product.attributePage.productAttributes
      const attrList = Array.isArray(attrs) ? attrs : (attrs?.en || [])
      console.log(`Extracted list length: ${attrList.length}`)
      if (attrList.length > 0) {
        console.log(`First item value: ${attrList[0].value}`)
      }
    }
  })
  
  process.exit(0)
}

debugAPI()
