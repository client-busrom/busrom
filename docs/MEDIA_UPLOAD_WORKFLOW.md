# 媒体上传完整工作流程

本文档提供从数据库初始化到批量上传图片的完整流程指南。

## 流程概览

```
步骤1: 初始化分类和标签
    ↓
步骤2: 本地测试验证
    ↓
步骤3: 部署到 AWS
    ↓
步骤4: 批量上传图片
    ↓
步骤5: 在 CMS 中验证
```

## 步骤 1: 初始化分类和标签

在上传任何图片之前,需要先创建 MediaCategory 和 MediaTag 数据。

### 1.1 确保数据库连接正常

```bash
cd busrom-work/cms

# 检查 .env 文件
cat .env | grep DATABASE_URL

# 测试数据库连接
npx prisma db push
```

### 1.2 运行初始化脚本

```bash
# 在 cms 目录下运行
npm run seed:media-taxonomy
```

预期输出:

```
╔════════════════════════════════════════════════════════════════╗
║  Seed Media Taxonomy                                           ║
║  初始化媒体分类和标签数据                                       ║
╚════════════════════════════════════════════════════════════════╝

📂 Creating Media Categories...
  ✅ Created: product-image
  ✅ Created: scene-image
  ✅ Created: actual-photo
  ... (12 个分类)

🏷️  Creating Product Series Tags...
  ✅ Created: series-glass-standoff
  ✅ Created: series-glass-connected-fitting
  ... (10 个产品系列)

⚙️  Creating Specification Tags...
  ✅ Created 100+ specification tags

🔖 Creating Custom Tags...
  ✅ Created: custom-logistics
  ✅ Created: custom-process

🎨 Creating Color Tags...
  ✅ Created: color-silver
  ✅ Created: color-black
  ... (6 个颜色)

═══════════════════════════════════════════════════════════════
📊 Summary:
   MediaCategories: 12
   MediaTags: 150+
═══════════════════════════════════════════════════════════════

✅ Media taxonomy seeded successfully!
```

### 1.3 在 CMS 中验证

1. 启动本地 CMS:

```bash
npm run dev
```

2. 访问 http://localhost:3000
3. 检查 `Media Categories` 列表,应该看到 12 个分类
4. 检查 `Media Tags` 列表,应该看到 150+ 个标签,按类型分组

## 步骤 2: 本地测试上传

在部署到 AWS 之前,先在本地测试批量上传功能。

### 2.1 准备测试图片

选择一个小批量的图片目录测试:

```bash
# 例如:测试 5 张图片
ls -la ../products/01-glass-standoff/product-images/general/ | head -10
```

### 2.2 创建测试元数据文件

创建 `test-metadata.json`:

```json
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff", "spec-general"],
  "defaultMetadata": {
    "seriesNumber": null,
    "specs": ["不锈钢"],
    "colors": ["银色"]
  }
}
```

### 2.3 运行批量上传测试

```bash
cd busrom-work/cms

# 测试上传 5 张图片
npm run batch-upload -- ../products/01-glass-standoff/product-images/general --metadata test-metadata.json
```

### 2.4 验证上传结果

1. 检查 CMS 中的 Media 列表
2. 确认图片已上传且元数据正确
3. 检查图片变体是否已生成
4. 查看 S3/MinIO 中的文件结构

如果本地测试成功,继续下一步。

## 步骤 3: 提交代码并部署到 AWS

### 3.1 提交代码

```bash
cd busrom-work

# 查看更改
git status

# 添加新文件
git add cms/scripts/seed-media-taxonomy.ts
git add scripts/batch-upload-with-variants.ts
git add scripts/batch-metadata-template.json
git add scripts/BATCH_UPLOAD_GUIDE.md
git add docs/MEDIA_CLASSIFICATION_STRUCTURE.md
git add docs/MEDIA_UPLOAD_WORKFLOW.md
git add cms/package.json

# 提交
git commit -m "feat: Add batch upload with variants and media taxonomy initialization

- Add seed-media-taxonomy script to initialize MediaCategory and MediaTag
- Add batch-upload-with-variants for efficient batch image upload
- Generate image variants (thumbnail, small, medium, large, xlarge, webp)
- Auto-extract metadata (width, height, fileSize, mimeType)
- Support metadata mapping via JSON files
- Add comprehensive documentation

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# 推送到远程
git push origin main
```

### 3.2 部署到 AWS

根据你的部署流程,将代码部署到 AWS:

```bash
# 示例:如果使用 Docker
./scripts/deploy-to-aws.sh

# 或者其他部署命令
```

### 3.3 在 AWS 上初始化分类和标签

SSH 到 AWS 实例或通过 ECS exec:

```bash
# 连接到生产环境
ssh ec2-user@your-production-server

# 进入项目目录
cd /path/to/busrom-cms

# 运行初始化脚本
npm run seed:media-taxonomy
```

## 步骤 4: 批量上传图片到 AWS

### 4.1 准备环境

确保本地有 AWS 凭证:

```bash
# 配置 AWS CLI
aws configure

# 测试 S3 访问
aws s3 ls s3://busrom-media-production/
```

### 4.2 创建上传计划

根据 `MEDIA_CLASSIFICATION_STRUCTURE.md`,制定上传计划。

**推荐顺序:**

1. 通用图片 (_common)
2. 产品 01 - 玻璃固定夹
3. 产品 02 - 玻璃连接件
4. ... 依次类推

### 4.3 批量上传示例

#### 4.3.1 上传通用图片

```bash
cd busrom-work/cms

# 1. 颜色展示图
cat > ../metadata-common-colors.json << 'EOF'
{
  "primaryCategory": "color-display",
  "tags": ["spec-common"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/_common/colors --metadata ../metadata-common-colors.json

# 2. 生产工艺图
cat > ../metadata-common-process.json << 'EOF'
{
  "primaryCategory": "manufacturing",
  "tags": ["spec-common", "custom-process"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/_common/manufacturing/process --metadata ../metadata-common-process.json

# 3. 包装图
cat > ../metadata-common-packages.json << 'EOF'
{
  "primaryCategory": "package-image",
  "tags": ["spec-common"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/_common/packages --metadata ../metadata-common-packages.json
```

#### 4.3.2 上传产品 01 - 玻璃固定夹

```bash
# 1. General 通用款
cat > ../metadata-01-general.json << 'EOF'
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff", "spec-general"],
  "defaultMetadata": {
    "seriesNumber": null
  }
}
EOF

npm run batch-upload -- ../products/01-glass-standoff/product-images/general --metadata ../metadata-01-general.json

# 2. Series 01
cat > ../metadata-01-s01.json << 'EOF'
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff", "spec-standoff-s01"],
  "defaultMetadata": {
    "seriesNumber": 1
  }
}
EOF

npm run batch-upload -- ../products/01-glass-standoff/product-images/s01 --metadata ../metadata-01-s01.json

# 3. Series 02 ~ 40 (可以用脚本循环)
for i in {02..40}; do
  cat > ../metadata-01-s${i}.json << EOF
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff", "spec-standoff-s${i}"],
  "defaultMetadata": {
    "seriesNumber": ${i#0}
  }
}
EOF

  npm run batch-upload -- ../products/01-glass-standoff/product-images/s${i} --metadata ../metadata-01-s${i}.json

  # 防止过载,每10个系列休息5秒
  if [ $((${i#0} % 10)) -eq 0 ]; then
    echo "Pausing for 5 seconds..."
    sleep 5
  fi
done

# 4. Scene Images 场景图
cat > ../metadata-01-scenes.json << 'EOF'
{
  "primaryCategory": "scene-image",
  "tags": ["series-glass-standoff"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/01-glass-standoff/scene-images --metadata ../metadata-01-scenes.json
```

#### 4.3.3 上传产品 02 - 玻璃连接件

```bash
# 1. Product Images - General
cat > ../metadata-02-general.json << 'EOF'
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-connected-fitting", "spec-general"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/02-glass-connected-fitting/product-images/general --metadata ../metadata-02-general.json

# 2. Product Images - Combined Elbow Adjustable
cat > ../metadata-02-combined-elbow-adjustable.json << 'EOF'
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-connected-fitting", "spec-combined-elbow-adjustable"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/02-glass-connected-fitting/product-images/combined-elbow-adjustable --metadata ../metadata-02-combined-elbow-adjustable.json

# ... 继续其他子分类

# 3. Actual Photos 实拍图
cat > ../metadata-02-actual.json << 'EOF'
{
  "primaryCategory": "actual-photo",
  "tags": ["series-glass-connected-fitting"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/02-glass-connected-fitting/actual-photos --metadata ../metadata-02-actual.json

# 4. Dimension Images 尺寸图
cat > ../metadata-02-dimension.json << 'EOF'
{
  "primaryCategory": "dimension-image",
  "tags": ["series-glass-connected-fitting"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/02-glass-connected-fitting/dimension-images --metadata ../metadata-02-dimension.json

# 5. Scene Images 场景图
cat > ../metadata-02-scenes.json << 'EOF'
{
  "primaryCategory": "scene-image",
  "tags": ["series-glass-connected-fitting"],
  "defaultMetadata": {}
}
EOF

npm run batch-upload -- ../products/02-glass-connected-fitting/scene-images --metadata ../metadata-02-scenes.json
```

### 4.4 创建自动化上传脚本

为了简化流程,可以创建一个完整的上传脚本:

```bash
#!/bin/bash
# upload-all-products.sh

set -e

METADATA_DIR="./metadata"
mkdir -p "$METADATA_DIR"

echo "Starting batch upload of all products..."

# Function to create metadata file
create_metadata() {
  local file=$1
  local category=$2
  local tags=$3
  local series_number=$4

  cat > "$file" << EOF
{
  "primaryCategory": "$category",
  "tags": $tags,
  "defaultMetadata": {
    ${series_number:+"seriesNumber": $series_number}
  }
}
EOF
}

# Upload common images
echo "=== Uploading Common Images ==="
create_metadata "$METADATA_DIR/common-colors.json" "color-display" '["spec-common"]'
npm run batch-upload -- ../products/_common/colors --metadata "$METADATA_DIR/common-colors.json"

# Upload Product 01
echo "=== Uploading Product 01 ==="
# ... 类似上面的逻辑

echo "✅ All uploads completed!"
```

## 步骤 5: 验证上传结果

### 5.1 在 CMS 中检查

1. 登录 CMS: https://cms.busromhouse.com
2. 导航到 `Media` 列表
3. 使用筛选功能测试:
   - 按 Category 筛选
   - 按 Tags 筛选
   - 按产品系列筛选
4. 随机抽查几张图片,验证:
   - 元数据正确
   - 变体已生成
   - 图片可以正常显示

### 5.2 检查 S3 存储

```bash
# 查看 S3 bucket 结构
aws s3 ls s3://busrom-media-production/ --recursive | head -50

# 检查变体目录
aws s3 ls s3://busrom-media-production/variants/

# 检查某个具体的变体
aws s3 ls s3://busrom-media-production/variants/thumbnail/
```

### 5.3 性能测试

在 CMS 中测试:

1. 列表加载速度
2. 筛选响应速度
3. 图片加载速度(通过 CDN)
4. 批量操作性能

## 故障排查

### 上传失败

**问题**: 某些图片上传失败

**排查步骤**:
1. 检查错误日志
2. 验证图片文件完整性
3. 检查文件大小(是否超过限制)
4. 检查网络连接
5. 检查 S3 凭证和权限

**解决方案**:
```bash
# 单独重试失败的图片
npm run batch-upload -- /path/to/failed/image --metadata metadata.json
```

### 元数据错误

**问题**: 上传成功但元数据不正确

**排查步骤**:
1. 检查 metadata.json 格式
2. 验证 tags 和 category 的 slug 是否正确
3. 检查数据库中的实际数据

**解决方案**:
```sql
-- 在数据库中更新元数据
UPDATE "Media"
SET metadata = '{"seriesNumber": 1}'::jsonb
WHERE filename LIKE '01-standoff-s01%';
```

### 变体生成失败

**问题**: 图片上传成功但变体未生成

**排查步骤**:
1. 检查 sharp 库是否正确安装
2. 检查内存使用情况
3. 查看服务器日志

**解决方案**:
```bash
# 重新生成变体
npm run regenerate-variants
```

## 最佳实践

1. **小批量测试**: 先上传 10-20 张图片测试,确认无误后再大批量上传
2. **备份原图**: 上传前备份所有原始图片
3. **记录进度**: 记录每次上传的批次和数量
4. **监控资源**: 关注 S3 存储空间和流量
5. **定期验证**: 上传完成后定期抽查验证数据完整性

## 总结

完整的工作流程:

```bash
# 1. 初始化分类和标签(仅运行一次)
npm run seed:media-taxonomy

# 2. 本地测试
npm run batch-upload -- ../products/test-dir --metadata test.json

# 3. 提交部署
git commit && git push
./deploy-to-aws.sh

# 4. 在 AWS 上初始化
npm run seed:media-taxonomy

# 5. 批量上传
npm run batch-upload -- ../products/01-glass-standoff/product-images/general --metadata metadata.json

# 6. 验证
# 在 CMS 中检查结果
```

按照此流程,可以高效、安全地完成所有产品图片的批量上传! 🚀
