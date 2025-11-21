# 生产环境部署指南 - Footer Navigation 更新

## ⚠️ 重要提示

本次更新为 Footer 添加了导航菜单配置功能，**仅添加新字段，不会删除或修改现有数据**。

## 更新内容

### CMS Schema 更改
- 在 `Footer` 模型中添加了两个新的关系字段：
  - `column3Menus`: 第三列导航菜单
  - `column4Menus`: 第四列导航菜单

### 数据库更改
- 新增两个关联表：
  - `_Footer_column3Menus`
  - `_Footer_column4Menus`
- **无数据丢失风险** - 仅添加新表，不修改现有表结构

### 前端更改
- Footer 组件支持两种布局：
  - 首页：保持原有表单布局
  - 其他页面：新增四列布局（Contact + Official Notice + 两列导航链接）

## 🚨 部署前必做步骤

### 1. 备份生产数据库

```bash
# 方法1：使用 pg_dump（推荐）
# 连接到生产环境数据库
aws ecs execute-command \
  --cluster your-cluster-name \
  --task your-task-id \
  --container cms \
  --interactive \
  --command "/bin/bash"

# 在容器内执行备份
pg_dump -h your-rds-endpoint \
  -U busrom_prod_user \
  -d busrom_cms_prod \
  --no-owner \
  --no-acl \
  -f /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# 下载备份文件到本地
aws s3 cp /tmp/backup_*.sql s3://your-backup-bucket/database-backups/

# 方法2：使用 AWS RDS 快照
aws rds create-db-snapshot \
  --db-instance-identifier your-rds-instance \
  --db-snapshot-identifier busrom-cms-backup-$(date +%Y%m%d-%H%M%S)
```

### 2. 验证迁移文件

检查迁移文件是否安全：

```bash
cd cms
cat migrations/20251121220000_add_footer_navigation_menus/migration.sql
```

**确认以下几点：**
- ✅ 使用 `CREATE TABLE IF NOT EXISTS`（安全）
- ✅ 使用 `CREATE INDEX IF NOT EXISTS`（安全）
- ✅ 使用 `DO $$ BEGIN ... IF NOT EXISTS` 检查约束（安全）
- ❌ 没有 `DROP TABLE`（危险）
- ❌ 没有 `ALTER TABLE ... DROP COLUMN`（危险）
- ❌ 没有 `TRUNCATE`（危险）

### 3. 在 Staging 环境测试

```bash
# 1. 部署到 staging
git checkout develop
git merge your-feature-branch

# 2. 连接到 staging 数据库
DATABASE_URL="postgresql://user:pass@staging-db:5432/busrom_cms" \
  npx prisma migrate deploy

# 3. 验证数据完整性
# 登录 staging CMS，检查所有数据是否完好

# 4. 测试新功能
# - 配置 Footer 导航菜单
# - 访问首页和其他页面，确认 Footer 显示正常
```

## 📋 生产环境部署步骤

### Step 1: 连接到生产环境

```bash
# 获取 ECS 任务 ID
aws ecs list-tasks \
  --cluster your-production-cluster \
  --service-name cms-service

# 连接到容器
aws ecs execute-command \
  --cluster your-production-cluster \
  --task <task-id> \
  --container cms \
  --interactive \
  --command "/bin/bash"
```

### Step 2: 执行迁移

```bash
# 在容器内执行
cd /app

# 查看待执行的迁移
npx prisma migrate status

# 应该看到：
# Status: 1 migration(s) not yet applied
# - 20251121220000_add_footer_navigation_menus

# 执行迁移（这个命令安全，只会添加新表）
npx prisma migrate deploy

# 验证迁移成功
npx prisma migrate status
# 应该显示：Database schema is up to date!
```

### Step 3: 验证数据完整性

```bash
# 在生产数据库中执行
psql $DATABASE_URL -c "
  SELECT
    (SELECT COUNT(*) FROM \"User\") as users,
    (SELECT COUNT(*) FROM \"Media\") as media,
    (SELECT COUNT(*) FROM \"Product\") as products,
    (SELECT COUNT(*) FROM \"Footer\") as footer,
    (SELECT COUNT(*) FROM \"FormConfig\") as form_configs,
    (SELECT COUNT(*) FROM \"NavigationMenu\") as nav_menus;
"
```

**预期结果：** 所有表的数据量应该与迁移前相同

### Step 4: 重启应用

```bash
# 退出容器
exit

# 强制新部署以应用代码更改
aws ecs update-service \
  --cluster your-production-cluster \
  --service cms-service \
  --force-new-deployment

# 等待服务稳定
aws ecs wait services-stable \
  --cluster your-production-cluster \
  --services cms-service
```

### Step 5: 验证功能

1. 登录生产环境 CMS
2. 进入 Footer 配置页面
3. 确认看到新增的字段：
   - Column 3 Navigation Menus
   - Column 4 Navigation Menus
4. 访问前端网站：
   - 首页：确认 Footer 表单正常显示
   - 其他页面：确认 Footer 四列布局正常显示

## 🔄 回滚计划（如果出现问题）

### 回滚数据库

```bash
# 1. 连接到生产环境容器
aws ecs execute-command ...

# 2. 回滚迁移
npx prisma migrate resolve --rolled-back 20251121220000_add_footer_navigation_menus

# 3. 手动删除新增的表（如果需要）
psql $DATABASE_URL -c "
  DROP TABLE IF EXISTS \"_Footer_column3Menus\" CASCADE;
  DROP TABLE IF EXISTS \"_Footer_column4Menus\" CASCADE;
"
```

### 回滚代码

```bash
# 重新部署之前的版本
git revert <commit-hash>
git push origin main

# 或者回滚到特定版本
aws ecs update-service \
  --cluster your-production-cluster \
  --service cms-service \
  --task-definition cms-task:previous-version
```

### 恢复数据库备份（最后手段）

```bash
# 从 S3 下载备份
aws s3 cp s3://your-backup-bucket/database-backups/backup_YYYYMMDD_HHMMSS.sql /tmp/

# 恢复数据库
psql $DATABASE_URL < /tmp/backup_YYYYMMDD_HHMMSS.sql
```

## ✅ 部署后检查清单

- [ ] 数据库迁移成功执行
- [ ] 所有表的数据量未减少
- [ ] CMS 可以正常登录
- [ ] Footer 配置页面显示新字段
- [ ] 首页 Footer 表单正常显示
- [ ] 其他页面 Footer 四列布局正常显示
- [ ] 没有 JavaScript 错误
- [ ] 没有 API 错误
- [ ] 性能正常（响应时间 < 2s）

## 📝 技术细节

### 为什么这次更新是安全的？

1. **只添加新表，不修改现有表**
   - 不会影响现有数据
   - 现有功能继续正常工作

2. **使用 IF NOT EXISTS**
   - 即使表已存在也不会报错
   - 可以安全地重复执行

3. **向后兼容**
   - 旧版本的应用仍然可以运行
   - 新字段是可选的

4. **前端渐进增强**
   - 如果没有配置导航菜单，前端不会报错
   - 只是不显示第三、第四列

## 🚨 本次事故教训

### 错误操作（不要重复）
```bash
# ❌ 危险：会清空数据！
npx prisma db push --accept-data-loss
```

### 正确操作
```bash
# ✅ 安全：生成迁移文件
npx prisma migrate dev --name descriptive_name

# ✅ 生产环境：只执行迁移，不生成
npx prisma migrate deploy
```

### 未来部署流程

1. **本地开发**
   ```bash
   # 修改 schema
   # 备份本地数据库
   docker exec busrom-postgres pg_dump -U busrom busrom_cms > backup.sql

   # 生成迁移
   npx prisma migrate dev --name feature_name
   ```

2. **提交代码**
   ```bash
   git add cms/schema.prisma
   git add cms/migrations/
   git commit -m "feat: add feature"
   ```

3. **部署到 Staging**
   ```bash
   # 自动执行迁移
   npx prisma migrate deploy
   ```

4. **验证 Staging**
   - 检查数据完整性
   - 测试新功能
   - 验证性能

5. **部署到 Production**
   ```bash
   # 备份生产数据库
   aws rds create-db-snapshot ...

   # 执行迁移
   npx prisma migrate deploy

   # 验证数据完整性
   ```

## 联系方式

如有任何问题，请联系：
- 开发团队: dev@busrom.com
- 运维团队: ops@busrom.com

---

**最后更新:** 2025-11-21
**版本:** 1.0.0
