// No imports needed for Node's global fetch

const CMS_URL = 'http://cms-production-alb-1976214150.us-east-1.elb.amazonaws.com'; // Production URL (internal or reachable)
// Wait, I should use the one from process.env if possible, but I don't have it.
// I'll try the reachable one if I can find it.
// Actually, I can use localhost:3002 if the user has it running, but no.
// I'll try to use the one I used in the RDS script (host only).

const prod_cms_base = 'http://cms-production-alb-1976214150.us-east-1.elb.amazonaws.com';

async function testFetch() {
  const blockId = 1; // From our RDS check
  const locale = 'en';
  const collections = ['product-reusable-blocks'];
  
  for (const col of collections) {
    const url = `${prod_cms_base}/api/${col}/${blockId}?locale=${locale}&depth=1`;
    console.log(`Fetching ${url}...`);
    try {
      const res = await fetch(url);
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Result content keys:', Object.keys(data));
        console.log('ContentTranslation exists?', !!data.contentTranslation);
        if (data.contentTranslation) {
           console.log('Root exists?', !!data.contentTranslation.root);
           if (data.contentTranslation.root) {
             console.log('Children count:', data.contentTranslation.root.children?.length);
           }
        }
      }
    } catch (e) {
      console.error('Fetch failed:', e.message);
    }
  }
}

testFetch();
