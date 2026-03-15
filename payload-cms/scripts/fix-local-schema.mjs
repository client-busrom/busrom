import pg from 'pg'
const { Client } = pg

// 使用 .env.local 中的本地连接字符串
const connectionString = 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload'

const client = new Client({ connectionString })

async function checkColumn(tableName, columnName) {
  try {
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name = $2
      );
    `, [tableName, columnName])
    return res.rows[0].exists
  } catch (e) {
    return false
  }
}

async function run() {
  await client.connect()
  console.log('Connected to local PostgreSQL')

  // 1. 修复 form_submissions 表
  console.log('Checking form_submissions columns...')
  if (!(await checkColumn('form_submissions', 'country_code'))) {
    await client.query('ALTER TABLE "form_submissions" ADD COLUMN "country_code" varchar')
    console.log('✅ Added country_code to form_submissions')
  }
  if (!(await checkColumn('form_submissions', 'country_name'))) {
    await client.query('ALTER TABLE "form_submissions" ADD COLUMN "country_name" varchar')
    console.log('✅ Added country_name to form_submissions')
  }

  // 2. 修复 products 表
  console.log('Checking products columns...')
  const productCols = [
    { name: 'linked_form_id', type: 'integer' },
    { name: 'shop_visibility', type: 'boolean DEFAULT true' },
    { name: 'is_hot', type: 'boolean DEFAULT false' },
    { name: 'is_new', type: 'boolean DEFAULT false' },
    { name: 'shop_order', type: 'numeric DEFAULT 0' }
  ]
  for (const col of productCols) {
    if (!(await checkColumn('products', col.name))) {
      await client.query(`ALTER TABLE "products" ADD COLUMN "${col.name}" ${col.type}`)
      console.log(`✅ Added ${col.name} to products`)
    }
  }

  // 3. 修复 product_series 表
  console.log('Checking product_series columns...')
  if (!(await checkColumn('product_series', 'is_featured'))) {
    await client.query('ALTER TABLE "product_series" ADD COLUMN "is_featured" boolean DEFAULT false')
    console.log('✅ Added is_featured to product_series')
  }

  // 4. 修复 categories 表
  console.log('Checking categories columns...')
  if (!(await checkColumn('categories', 'show_in_shop'))) {
    await client.query('ALTER TABLE "categories" ADD COLUMN "show_in_shop" boolean DEFAULT true')
    console.log('✅ Added show_in_shop to categories')
  }
  if (!(await checkColumn('categories', 'shop_tab_order'))) {
    await client.query('ALTER TABLE "categories" ADD COLUMN "shop_tab_order" numeric DEFAULT 0')
    console.log('✅ Added shop_tab_order to categories')
  }

  console.log('\n🎉 Local database schema fix completed!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error fixing local DB:', err.message)
  process.exit(1)
})
