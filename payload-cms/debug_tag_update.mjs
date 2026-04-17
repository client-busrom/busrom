import { getPayload } from 'payload'
import config from './src/payload.config.ts'

async function debugUpdate() {
  console.log('Initializing Payload...')
  const payload = await getPayload({ config })
  
  try {
    console.log('Attempting to update blog-tags/2 with blogs: [6]...')
    const res = await payload.update({
      collection: 'blog-tags',
      id: 2,
      data: {
        blogs: [6]
      },
      depth: 0,
    })
    console.log('Success!', res)
  } catch (e) {
    console.error('FAILED TO UPDATE TAG 2')
    console.error('Error details:', JSON.stringify(e, null, 2))
    if (e.data && e.data.errors) {
        console.error('Validation errors:', JSON.stringify(e.data.errors, null, 2))
    }
  }
}

debugUpdate()
