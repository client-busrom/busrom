const fs = require('fs')

const fileParams = [
  'localhost_3001-20251225T035908.json',
  'localhost_3001-20251225T041010.json',
  'localhost_3001-20251225T145426.json',
  'localhost_3001-20251225T151617.json',
  'localhost_3001-20251225T155003.json',
  'localhost_3001-20251225T160729.json',
  'localhost_3001-20251228T224008.json',
  'localhost_3001-20260125T204452.json'
];

for (const p of fileParams) {
  try {
     const data = fs.readFileSync('/Users/cerfbaleine/Downloads/' + p, 'utf-8')
     if (data.includes('oem-odm-guide')) {
        console.log("Found in " + p)
     }
  } catch(e) {}
}
