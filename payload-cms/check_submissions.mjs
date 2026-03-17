import { getPayload } from 'payload'
import config from './payload.config'

async function checkSubmissions() {
  const payload = await getPayload({ config })
  const submissions = await payload.find({
    collection: 'form-submissions',
    limit: 5,
    sort: '-submittedAt',
  })

  console.log('Recent Submissions:')
  submissions.docs.forEach(doc => {
    console.log(`ID: ${doc.id}, Form: ${doc.formName}, Email Sent: ${doc.emailSent}, Status: ${doc.status}`)
  })
  
  process.exit(0)
}

checkSubmissions()
