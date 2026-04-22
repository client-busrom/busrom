import { getPayload } from 'payload';
import config from './payload.config.ts';

async function run() {
  process.env.PAYLOAD_CONFIG_PATH = 'payload.config.ts';
  const payload = await getPayload({ config });
  
  const faqs = await payload.find({
    collection: 'faq-items',
    limit: 100,
  });
  
  console.log('--- LOCAL FAQ DATA ---');
  console.log(JSON.stringify(faqs.docs.map(f => ({
    q: f.question,
    ans: f.answer || f.contentTranslation
  })), null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
