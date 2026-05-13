import { getPayload } from 'payload'
import configPromise from '../../payload.config'

async function checkDoc() {
  const payload = await getPayload({ config: configPromise })
  try {
    const doc = await payload.findByID({
      collection: 'blogs',
      id: '11',
      depth: 0,
      showHiddenFields: true,
    })
    console.log('✅ Document 11 Status:', doc.status)
    console.log('✅ Document 11 UpdatedAt:', doc.updatedAt)
  } catch (e: any) {
    console.error('❌ Document 11 NOT found:', e.message)
    
    // List some docs to see what IDs we have
    const allDocs = await payload.find({
      collection: 'blogs',
      limit: 10,
      depth: 0,
    })
    console.log('Available IDs:', allDocs.docs.map(d => d.id))
  }
  process.exit(0)
}

checkDoc()
