// @ts-nocheck
import { getPayload } from 'payload'
import config from '../../payload.config.ts'

const test = async () => {
  const payload = await getPayload({ config })
  
  // Find products with attributePage
  const products = await payload.find({
    collection: 'products',
    depth: 2,
    limit: 1,
    locale: 'en',
    where: {
      attributePage: { exists: true }
    }
  })

  console.log('Product with attributePage:')
  console.log(JSON.stringify(products.docs[0], null, 2))
  
  const product = products.docs[0]
  const features = (product.attributePage?.productAttributes || [])
    .filter((attr: any) => attr.showOnFrontEnd !== false)
    .slice(0, 4)
    .map((attr: any) => attr.value)
    
  console.log('\nExtracted Features:', features)

  process.exit(0)
}
test()
