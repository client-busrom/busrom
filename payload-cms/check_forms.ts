import { getPayload } from 'payload'
import config from './payload.config'

async function checkForms() {
  const payload = await getPayload({ config })
  const forms = await payload.find({
    collection: 'form-configs',
  })

  console.log('Available Forms:')
  forms.docs.forEach(doc => {
    console.log(`ID: ${doc.id}, Name: ${doc.name}, DisplayName: ${doc.displayName}`)
  })
  
  const smtps = await payload.find({
    collection: 'smtp-configs',
  })
  
  console.log('\nAvailable SMTP Configs:')
  smtps.docs.forEach(doc => {
    console.log(`ID: ${doc.id}, Status: ${doc.status}, Forms: ${Array.isArray(doc.formConfigs) ? doc.formConfigs.map(f => typeof f === 'object' ? f.id : f).join(', ') : 'None'}`)
  })
  
  process.exit(0)
}

checkForms()
