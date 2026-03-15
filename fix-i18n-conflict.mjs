import pg from 'pg';
const { Client } = pg;

// 生产数据库连接字符串
const PROD_DB_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify';

async function fixI18nConflict() {
  const client = new Client({ connectionString: PROD_DB_URL });

  try {
    console.log('正在连接生产数据库...');
    await client.connect();
    console.log('连接成功。');

    console.log('正在清理冲突的数据库对象...');

    // 1. 清理文档模版相关的冲突对象
    const query1 = 'DROP SEQUENCE IF EXISTS document_templates_locales_id_seq CASCADE;';
    const query2 = 'DROP TABLE IF EXISTS document_templates_locales CASCADE;';
    
    // 2. 清理枚举类型冲突
    const query3 = 'DROP TYPE IF EXISTS "public"."enum_brand_advantages_status" CASCADE;';
    
    console.log('执行: ' + query1);
    await client.query(query1);
    
    console.log('执行: ' + query2);
    await client.query(query2);
    
    console.log('执行: ' + query3);
    await client.query(query3);

    console.log('清理完成！Payload 现在应该能成功创建多语言表结构。');

  } catch (err) {
    console.error('修复生产环境数据库时出错:', err);
  } finally {
    await client.end();
    console.log('数据库连接已关闭。');
  }
}

fixI18nConflict();
