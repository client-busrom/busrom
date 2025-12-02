# Sync Media Tags to TagsFilter - Deployment Guide

## 问题说明

现有的 Media 记录有 `tags` 数据，但 `tagsFilter` 字段为空，导致 CMS 列表视图中的筛选功能无法正常工作。

### 为什么会出现这个问题？

1. **两个字段的用途**：
   - `tags`: 使用自定义分组 UI，用于编辑
   - `tagsFilter`: 使用标准 select UI，用于列表视图筛选

2. **同步机制**：
   - 新建/更新记录时，`resolveInput` hook 会自动同步 `tags` → `tagsFilter`
   - 但现有的记录（在添加此机制之前导入的）没有被同步

3. **影响**：
   - CMS 管理员无法通过标签筛选媒体文件
   - 例如：无法筛选出所有 `series-glass-standoff` 的图片

## 解决方案

运行 `sync-media-tags-filter.js` 脚本来同步所有现有记录。

## 部署后在 AWS ECS 上执行

### 方法 1: 使用 ECS Exec（推荐）

```bash
# 1. 获取 CMS task ARN
aws ecs list-tasks \
  --cluster busrom-cluster \
  --service-name busrom-cms-service \
  --region us-east-1

# 2. 执行脚本
aws ecs execute-command \
  --cluster busrom-cluster \
  --task <TASK_ARN> \
  --container busrom-cms \
  --command "/bin/sh -c 'cd /app && node cms/scripts/sync-media-tags-filter.js'" \
  --interactive \
  --region us-east-1
```

### 方法 2: 通过 SSH 到 EC2（如果使用 EC2 launch type）

```bash
# 1. SSH 到 EC2 实例
ssh ec2-user@<EC2_IP>

# 2. 找到 CMS container
docker ps | grep busrom-cms

# 3. 执行脚本
docker exec -it <CONTAINER_ID> node cms/scripts/sync-media-tags-filter.js
```

### 方法 3: 创建一次性 ECS Task

创建一个 task definition 运行此脚本：

```bash
aws ecs run-task \
  --cluster busrom-cluster \
  --task-definition busrom-cms-migration \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --overrides '{"containerOverrides":[{"name":"busrom-cms","command":["node","cms/scripts/sync-media-tags-filter.js"]}]}' \
  --region us-east-1
```

## 本地测试

在推送到生产环境之前，可以在本地测试：

```bash
# 确保本地数据库连接正确
export DATABASE_URL="postgresql://busrom:busrom@localhost:5432/busrom_cms"

# 运行脚本
node cms/scripts/sync-media-tags-filter.js
```

## 预期输出

```
🔄 Starting sync of tags to tagsFilter...

📊 Found 2074 media items

✅ Synced 50 items...
✅ Synced 100 items...
✅ Synced 150 items...
...
✅ Synced 2050 items...

📈 Sync Summary:
   ✅ Synced: 2074
   ⏭️  Skipped (already in sync): 0
   ❌ Errors: 0

✨ Done!
```

## 验证修复

同步完成后，在 CMS 中验证：

1. 登录 CMS: https://cms.busromhouse.com
2. 进入 Media 列表
3. 使用 "Tags Filter" 下拉菜单
4. 选择 `series-glass-standoff`
5. 应该能看到 205 张相关图片

## 注意事项

- ✅ 脚本是**幂等的**：可以多次运行，已同步的记录会被跳过
- ✅ 脚本**只读取和更新** tagsFilter 字段，不修改 tags 或其他数据
- ✅ 使用事务处理，不会造成数据不一致
- ⚠️  大量数据时可能需要几分钟完成（~2000 条记录约 1-2 分钟）

## 长期解决方案

此问题已通过 `Media.ts` schema 中的 `resolveInput` hook 修复，所有新建/更新的记录会自动同步。

此脚本仅需在以下情况运行：
- 首次部署此修复后（一次性）
- 从备份恢复数据后
- 手动修改数据库导致不同步时

## 相关文件

- **脚本**: `cms/scripts/sync-media-tags-filter.js`
- **Schema**: `cms/schemas/Media.ts` (line 389-396)
- **数据库表**: `_Media_tags` 和 `_Media_tagsFilter`

## 技术细节

### 数据库关系

```sql
-- tags 关系
_Media_tags (
  A uuid REFERENCES Media(id),  -- Media ID
  B uuid REFERENCES MediaTag(id) -- Tag ID
)

-- tagsFilter 关系（应该与 tags 相同）
_Media_tagsFilter (
  A uuid REFERENCES Media(id),  -- Media ID
  B uuid REFERENCES MediaTag(id) -- Tag ID
)
```

### 同步逻辑

1. 查询所有 Media 记录及其 tags 和 tagsFilter
2. 对比两个字段的 tag IDs
3. 如果不匹配，将 tags 的 IDs 同步到 tagsFilter
4. 使用 Prisma 的 `set` 操作确保数据一致性
