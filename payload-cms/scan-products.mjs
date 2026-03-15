import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function scanProducts() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // Look for all references in Products
    const res = await client.query(`SELECT _parent_id, _locale, content_translation FROM products_locales`);
    for (const row of res.rows) {
       if (!row.content_translation) continue;
       const contentStr = JSON.stringify(row.content_translation);
       if (contentStr.includes('eusableBlock') && contentStr.includes('"1"')) {
         console.log(`Product ID ${row._parent_id} (${row._locale}) has block ID 1 reference.`);
         // Identify node type
         const regex = /"(type)":"(seriesReusableBlock|productReusableBlock|reusableBlock)","data":\{"[^"]+":\{"id":"([^"]+)"/g;
         let match;
         while ((match = regex.exec(contentStr)) !== null) {
            console.log(`  -> Type: ${match[2]}, ID: ${match[3]}`);
         }
       }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

scanProducts();
