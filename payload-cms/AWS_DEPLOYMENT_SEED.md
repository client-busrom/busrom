# AWS Production 环境 - Homepage 数据部署指南

## 🎯 快速开始

在 AWS production 环境的 Payload CMS 容器中运行：

```bash
npx tsx src/seed/seed-production-homepage.ts
```

就这么简单！脚本会自动：
- ✅ 导入 14 个 homepage globals
- ✅ 所有内容包含完整的英文和中文翻译
- ✅ 不需要从 Keystone CMS 迁移

## 📦 将导入的内容

### Globals (14个) - 全部成功 ✅

1. **service-features** - 服务特性
   - 5个功能：任意尺寸/结构/形状、多市场支持、RAL颜色、PVD技术、OEM/ODM

2. **sphere-3d** - 3D球体配置

3. **simple-cta** - 简单CTA模块

4. **featured-products** - 精选产品
   - 注：categories 字段已清空（需要产品数据后手动配置）

5. **brand-advantages** - 品牌优势
   - 9个优势点

6. **oem-odm** - OEM/ODM内容

7. **quote-steps** - 报价步骤
   - 5个步骤流程

8. **main-form** - 主表单配置

9. **why-choose-busrom** - 为什么选择Busrom
   - 包含 title2 和 viewMoreButtonText 的中文翻译
   - 5个选择理由

10. **case-studies** - 案例研究

11. **brand-analysis** - 品牌分析

12. **brand-value** - 品牌价值
    - param1Title: 品质, param2Title: 创新

13. **footer** - 页脚
    - 完整的联系信息标签（中文）
    - 4行官方声明（中英双语）

14. **product-series-carousel** - 产品系列轮播

## 📋 部署前检查清单

### 必需条件：
- ✅ PostgreSQL 数据库已初始化
- ✅ Payload CMS 已部署并运行
- ✅ 环境变量已正确配置

### 可选但推荐：
- ⏳ S3 bucket 中的 media 文件已迁移
- ⏳ Products 数据已导入（用于 featured-products categories）

## 🚀 详细部署步骤

### 步骤 1: 确认文件存在

```bash
ls -la src/seed/homepage-data-export.json
# 应该看到约 3500 行的 JSON 文件
```

### 步骤 2: 运行 seed 脚本

```bash
npx tsx src/seed/seed-production-homepage.ts
```

### 步骤 3: 验证结果

脚本运行后会显示：

```
🏠 Seeding Production Homepage Data
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Loading data from: /path/to/homepage-data-export.json
📊 Data loaded:
   - Globals: 14
   - Collections: 1
   - Exported: 2025/12/16

🌱 Seeding globals...
  ✅ service-features
  ✅ sphere-3d
  ✅ simple-cta
  ℹ️  featured-products (categories field cleared)
  ✅ featured-products
  ✅ brand-advantages
  ✅ oem-odm
  ✅ quote-steps
  ✅ main-form
  ✅ why-choose-busrom
  ✅ case-studies
  ✅ brand-analysis
  ✅ brand-value
  ✅ footer
  ✅ product-series-carousel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Production Homepage Seeding Complete!
   Success: 14
   Errors: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 步骤 4: 测试 API 端点

```bash
# 测试英文版本
curl https://your-domain.com/api/home?locale=en | jq '.serviceFeatures'

# 测试中文版本
curl https://your-domain.com/api/home?locale=zh | jq '.whyChooseBusrom.title2'
# 应该返回: "Busrom"

curl https://your-domain.com/api/home?locale=zh | jq '.whyChooseBusrom.viewMoreButtonText'
# 应该返回: "查看更多信息"
```

## 🔍 验证数据完整性

### 检查关键中文翻译

运行以下命令验证中文翻译已正确导入：

```bash
curl -s 'https://your-domain.com/api/home?locale=zh' | python3 << 'EOF'
import json, sys
data = json.load(sys.stdin)

checks = [
    ('Why Choose Busrom - title2', data['whyChooseBusrom']['title2'], 'Busrom'),
    ('Why Choose Busrom - viewMoreButtonText', data['whyChooseBusrom']['viewMoreButtonText'], '查看更多信息'),
    ('Footer - emailLabel', data['footer']['contact']['emailLabel'], '电子邮箱'),
    ('Footer - afterSalesLabel', data['footer']['contact']['afterSalesLabel'], '售后服务'),
    ('Service Features count', len(data['serviceFeatures']['features']), 5),
]

print('🔍 验证结果：\n')
all_pass = True
for name, actual, expected in checks:
    status = '✅' if actual == expected else '❌'
    print(f'{status} {name}: {actual}')
    if actual != expected:
        all_pass = False

print('\n' + ('✅ 所有验证通过！' if all_pass else '❌ 有验证失败'))
EOF
```

## ⚙️ Docker 集成

### 在 Dockerfile 中包含 seed 数据

确保 Dockerfile 复制了 seed 文件：

```dockerfile
# Dockerfile
COPY src/seed/homepage-data-export.json /app/src/seed/
COPY src/seed/seed-production-homepage.ts /app/src/seed/
```

### 在启动脚本中运行 seed

```bash
# entrypoint.sh 或 init script
#!/bin/bash

# 等待数据库就绪
until pg_isready -h $DATABASE_HOST -p $DATABASE_PORT; do
  echo "Waiting for database..."
  sleep 2
done

# 运行 database migrations
npx payload migrate

# Seed homepage data (只在首次部署时运行)
if [ "$SEED_HOMEPAGE" = "true" ]; then
  echo "Seeding homepage data..."
  npx tsx src/seed/seed-production-homepage.ts
fi

# 启动应用
npm start
```

### 环境变量

```bash
# .env.production
SEED_HOMEPAGE=true  # 首次部署时设为 true，之后设为 false
```

## 🔄 更新数据流程

如果需要更新 production 的 homepage 数据：

### 方法一：从开发环境重新导出（推荐）

```bash
# 在开发环境
cd /path/to/dev/payload-cms

# 1. 导出最新数据
npx tsx scripts/export-homepage-data.ts

# 2. 检查翻译
npx tsx scripts/check-missing-translations.ts

# 3. 复制到 seed 目录
cp scripts/homepage-data-export.json src/seed/

# 4. 提交到 git
git add src/seed/homepage-data-export.json
git commit -m "chore: update homepage seed data"
git push

# 5. 在 production 重新部署并运行 seed
```

### 方法二：直接在 production admin 修改

登录 production 的 Payload admin：
- URL: `https://your-domain.com/admin`
- 手动编辑各个 globals
- 支持中英文翻译界面

## ⚠️ 重要注意事项

### 1. Navigation Menus
- Navigation menus 在当前 seed 中会跳过
- 建议在 admin 界面中手动配置
- 或单独创建 navigation seed 脚本

### 2. Featured Products Categories
- `categories` 字段在 seed 时会被清空
- 需要在产品数据导入后，在 admin 中手动关联产品系列

### 3. Media 引用
- Seed 数据包含 media ID 引用
- 需要确保 S3 bucket 中有对应的图片文件
- 或在 admin 中重新上传并关联图片

### 4. 幂等性
- Seed 脚本可以安全地多次运行
- 会更新现有数据，不会创建重复记录

## 📊 数据大小和性能

- **文件大小**: 约 700KB (3500 行 JSON)
- **执行时间**: 约 10-15 秒
- **数据库操作**: 14 个 UPDATE 操作
- **网络影响**: 仅本地数据库操作，无外部 API 调用

## 🆘 故障排查

### 问题 1: "homepage-data-export.json not found"

```bash
# 解决方案：确认文件路径
ls -la src/seed/homepage-data-export.json

# 如果文件不存在，从 scripts 目录复制
cp scripts/homepage-data-export.json src/seed/
```

### 问题 2: Database connection 失败

```bash
# 检查数据库连接
psql $DATABASE_URL -c "SELECT version();"

# 检查环境变量
echo $DATABASE_URL
```

### 问题 3: 某些 globals 失败

- 查看详细错误信息
- 检查 schema 是否匹配
- 验证 Payload 版本兼容性

## ✅ 部署后验证

完整的验证清单：

- [ ] Service Features 显示 5 个功能（中英文）
- [ ] Why Choose Busrom 显示 5 个理由 + title2 + 按钮
- [ ] Footer 显示完整联系信息和官方声明
- [ ] Brand Advantages 显示 9 个优势
- [ ] Quote Steps 显示 5 个步骤
- [ ] 所有内容在 `/en` 和 `/zh` 页面都正确显示
- [ ] API 端点 `/api/home?locale=en` 和 `?locale=zh` 返回正确数据

## 📝 总结

使用这个 seed 系统，你可以：

✅ **一键部署** - 单个命令完成所有 homepage globals 导入
✅ **完整双语** - 所有内容包含英文和中文翻译
✅ **无需 Keystone** - 不再依赖旧的 Keystone CMS
✅ **可重复执行** - 安全地更新数据
✅ **开发一致** - 开发和生产环境数据同步

**现在你可以在 AWS production 环境快速部署完整的 homepage 数据！** 🚀
