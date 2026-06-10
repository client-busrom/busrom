const fs = require('fs');
const path = require('path');

const files = ['404.csv', 'soft_404.csv'];
const output = path.join(__dirname, '../redirects.json');

const redirects = [];

for (const file of files) {
  const filePath = path.join(__dirname, '../docs/gsc_exports', file);
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',');
      const urlStr = parts[0];
      
      try {
        const urlObj = new URL(urlStr);
        let pathname = urlObj.pathname;
        
        // Skip root
        if (pathname === '/') continue;

        // Determine destination
        let destination = '/';
        
        if (pathname.includes('/shop')) {
          destination = '/shop';
        } else if (pathname.includes('/blog')) {
          destination = '/blog';
        } else if (pathname.includes('/product')) {
          destination = '/shop';
        }

        // Handle crazy URLs like /kohttps://www.busromhouse.com
        if (pathname.includes('http')) {
          pathname = pathname.substring(0, pathname.indexOf('http'));
          if (pathname === '') continue; // ignore
        }

        redirects.push({
          source: pathname,
          destination: destination,
          permanent: true
        });
      } catch (e) {
        // Ignore invalid URL
      }
    }
  }
}

// Deduplicate by source
const uniqueRedirects = [];
const seen = new Set();
for (const r of redirects) {
  if (!seen.has(r.source)) {
    seen.add(r.source);
    uniqueRedirects.push(r);
  }
}

fs.writeFileSync(output, JSON.stringify(uniqueRedirects, null, 2));
console.log(`Generated ${uniqueRedirects.length} redirects to redirects.json`);
