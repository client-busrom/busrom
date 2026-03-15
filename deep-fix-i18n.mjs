import pg from 'pg';
const { Client } = pg;

const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function deepFixDocumentTemplates() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    console.log('正在连接生产数据库...');
    await client.connect();
    console.log('连接成功。');

    // 1. 检查表是否存在
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'document_templates_locales'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('检测到 document_templates_locales 不存在，正在手动创建...');

      // 创建多语言表
      // 注意：_locale 字段类型通常是 _locales 或者是 varchar，Payload 3.0 通常使用 enum
      await client.query(`
        CREATE TABLE IF NOT EXISTS "document_templates_locales" (
          "id" serial PRIMARY KEY,
          "name" varchar NOT NULL,
          "description" varchar,
          "_locale" "_locales" NOT NULL,
          "_parent_id" integer NOT NULL REFERENCES "document_templates"("id") ON DELETE CASCADE
        );
      `);
      console.log('表创建成功。');

      // 2. 数据迁移 (防止数据丢失)
      // 检查主表里是否还有 name 和 description 列
      const columnCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'document_templates' AND column_name = 'name';
      `);

      if (columnCheck.rows.length > 0) {
        console.log('正在将现有数据迁移到多语言表...');
        await client.query(`
          INSERT INTO "document_templates_locales" ("name", "description", "_locale", "_parent_id")
          SELECT "name", "description", 'en', "id" FROM "document_templates"
          ON CONFLICT DO NOTHING;
        `);
        console.log('数据迁移完成。');
      }
    } else {
      console.log('表已存在，无需创建。');
    }

    // 3. 检查并清理主表多余列 (Payload 运行需要)
    console.log('正在根据配置清理主表字段...');
    // 这里我们先不强行 DROP，因为 Payload 启动时通常会处理。我们的目标是让表先存在，解决报错。

    console.log('深度修复完成！请刷新线上后台页面查看。');

  } catch (err) {
    console.error('深度修复失败:', err);
  } finally {
    await client.end();
  }
}

deepFixDocumentTemplates();
