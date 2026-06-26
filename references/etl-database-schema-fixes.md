# ETL 与数据库 Schema 修复参考

> 对应代码：`cdp/src/db/schema.ts`、`cdp/src/jobs/*`、`cdp/drizzle.config.ts`

---

## 重新生成 Drizzle 迁移

```bash
cd cdp
npm run db:generate
```

这会读取 `src/db/schema.ts` 并在 `src/db/migrations` 生成新的 SQL 迁移文件。运行前确保：

- `DATABASE_URL` 指向正确的 PostgreSQL 实例。
- 已安装 `cdp` 依赖：`cd cdp && npm install`。

应用迁移：

```bash
cd cdp
npm run db:migrate
```

开发环境快速同步（谨慎用于生产）：

```bash
cd cdp
npm run db:push
```

---

## 安全加列

只执行向后兼容的变更：

- 添加新表
- 添加**可选**字段（nullable）
- 添加带**默认值**的字段

示例（schema.ts 中）：

```ts
newColumn: varchar('new_column', { length: 100 }).default(''),
```

对应生成迁移后，历史行会自动填充默认值，无需停机。

危险操作（需分多步）：

- 添加无默认值的 NOT NULL 字段
- 删除/重命名字段
- 修改字段类型

---

## 回填数据

### SQL 示例

给新增的可选字段补充历史数据：

```sql
UPDATE traffic_raw
SET channel = 'direct'
WHERE channel IS NULL;
```

### tsx 脚本示例

```ts
// cdp/scripts/backfill-channel.ts
import { db } from '../src/db'
import { trafficRaw } from '../src/db/schema'
import { isNull } from 'drizzle-orm'

async function main() {
  const result = await db
    .update(trafficRaw)
    .set({ channel: 'direct' })
    .where(isNull(trafficRaw.channel))

  console.log('Updated rows:', result.rowCount)
}

main().catch(console.error)
```

运行：

```bash
cd cdp
npx tsx scripts/backfill-channel.ts
```

---

## 常见错误

### 1. 密码掩码导致连接失败

`.env` 中的密码在 AI 读取时可能被显示为 `***`，这不是真实密码。调试时通过运行中容器确认：

```bash
docker exec <container> env | grep POSTGRES
```

ETL 脚本需要显式传递真实密码给子进程。

### 2. PostgreSQL 认证方式冲突

错误示例：

```
error: password authentication failed for user "..."
```

- `scram-sha-256` 与 `md5` 混用会导致旧客户端失败。
- 检查 `pg_hba.conf` 与 PostgreSQL 版本。
- 本地开发推荐统一使用 `scram-sha-256`，并确保连接字符串中的密码正确。

### 3. 数据库不存在

```
error: database "busrom_cdp" does not exist
```

解决：

```bash
psql -U postgres -c "CREATE DATABASE busrom_cdp;"
```

然后重新运行迁移。

### 4. 列不存在 / 表不存在

通常是 schema 与数据库不一致。修复步骤：

1. 确认 `schema.ts` 已包含目标表/列。
2. 重新生成并应用迁移：`npm run db:generate && npm run db:migrate`。
3. 若生产环境已有数据，使用安全加列或回填脚本，避免直接 `db:push`。
