const fetch = require('node-fetch');

async function test() {
  const cmsUrl = 'https://cms.busromhouse.com';
  const slug = 'application';
  const locale = 'en';

  console.log('Starting fetch payload CMS ...');
  const start = Date.now();
  try {
    const pageRes = await fetch(`${cmsUrl}/api/pages?where[slug][equals]=${slug}&locale=${locale}&depth=2`);
    console.log('Got pages API response in', Date.now() - start, 'ms');
    const result = await pageRes.json();
    console.log('docs length:', result.docs?.length);
  } catch(e) {
    console.error('Fetch error:', e);
  }
}
test();
