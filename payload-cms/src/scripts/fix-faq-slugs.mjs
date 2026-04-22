import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false }
});

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 去掉标点（问号、撇号等）
    .replace(/[\s_]+/g, '-')  // 将空格和下划线替换为连字符
    .replace(/-+/g, '-')      // 去掉多个重复的连字符
    .replace(/^-+|-+$/g, ''); // 去掉首尾的连字符
};

async function run() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. 获取所有问题原文
    const res = await client.query(`
      SELECT f.id, fl.question 
      FROM faq_items f 
      JOIN faq_items_locales fl ON f.id = fl._parent_id 
      WHERE fl._locale = 'en'
    `);

    console.log(`Found ${res.rows.length} FAQ items to update.`);

    // 2. 逐一更新 Slug
    for (let row of res.rows) {
      const newSlug = slugify(row.question);
      await client.query('UPDATE faq_items SET slug = $1 WHERE id = $2', [newSlug, row.id]);
      console.log(`ID ${row.id}: Updated slug to -> ${newSlug}`);
    }

    console.log('Successfully reset all technical slugs based on English questions.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
