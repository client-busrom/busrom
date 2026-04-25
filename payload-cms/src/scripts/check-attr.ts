// @ts-nocheck
import { getPayload } from 'payload'
import config from '../../payload.config.ts'

const check = async () => {
  const payload = await getPayload({ config })
  const source = await payload.findByID({
    collection: 'product-attributes',
    id: 3,
    locale: 'all'
  })
  console.log(JSON.stringify(source, null, 2))
  process.exit(0)
}
check()
