import pg from 'pg';
const { Client } = pg;

const DATABASE_URI = 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload';

async function checkAllSeqs() {
  const client = new Client({ connectionString: DATABASE_URI });

  try {
    await client.connect();
    
    const tables = [
      'categories', 'users', 'media', 'products', 'blogs', 'pages', 
      'applications', 'faq_items', 'reusable_blocks', 'hero_banner_items',
      'navigation_menus', 'authors', 'document_templates'
    ];

    console.log('--- Database Sequence Sync Check ---');
    console.log('| Table Name | Max ID | Seq Value | Status |');
    console.log('|------------|--------|-----------|--------|');

    for (const table of tables) {
      try {
        const maxRes = await client.query(`SELECT MAX(id) as max_id FROM "${table}";`);
        const maxId = Number(maxRes.rows[0].max_id || 0);
        
        const seqRes = await client.query(`SELECT last_value, is_called FROM ${table}_id_seq;`);
        const seqVal = Number(seqRes.rows[0].last_value);
        const isCalled = seqRes.rows[0].is_called;

        let status = '✅ OK';
        // If is_called is false, next value is seqVal. If true, next is seqVal + 1.
        const nextVal = isCalled ? seqVal + 1 : seqVal;
        
        if (maxId >= nextVal) {
          status = '❌ BROKEN';
        }

        console.log(`| ${table.padEnd(12)} | ${maxId.toString().padEnd(6)} | ${seqVal.toString().padEnd(9)} | ${status} |`);
      } catch (e) {
        // Skip
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkAllSeqs();
