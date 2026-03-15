import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function inspectLexicalContent() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    await client.connect();
    console.log('Connected.');

    // Find a SeriesTemplate that contains the reusable block
    console.log('Fetching SeriesTemplates locales content...');
    const res = await client.query(`
      SELECT _parent_id, _locale, content FROM series_templates_locales LIMIT 10
    `);

    for (const row of res.rows) {
      const content = row.content;
      if (!content) continue;
      
      const contentStr = JSON.stringify(content);
      const hasReusable = contentStr.includes('reusableBlock') || 
                         contentStr.includes('seriesReusableBlock') || 
                         contentStr.includes('productReusableBlock');
      
      if (hasReusable) {
        console.log(`Found reusable block reference in Template ID ${row._parent_id} (${row._locale})`);
        // Find the node details
        function findBlocks(nodes) {
          if (!nodes) return;
          for (const node of nodes) {
            if (node.type?.includes('ReusableBlock')) {
              console.log('Block Node:', JSON.stringify(node, null, 2));
            }
            if (node.children) findBlocks(node.children);
            if (node.root) findBlocks(node.root.children);
          }
        }
        findBlocks(content.root?.children);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

inspectLexicalContent();
