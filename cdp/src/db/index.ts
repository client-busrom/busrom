import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// 使用环境变量配置数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// 导出 Drizzle ORM 实例
export const db = drizzle(pool, { schema })

// 导出原始 pool 用于直接查询
export { pool }

// 健康检查函数
export async function checkDatabaseHealth() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    return { healthy: true, timestamp: result.rows[0].now }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { healthy: false, error: String(error) }
  }
}
