# CMS Scripts Documentation

## 📋 Available Scripts

### 1. Seed Navigation Menus (导航菜单数据生成)

**脚本**: `seed-navigation-menus.ts`

**用途**: 自动生成网站的导航菜单结构

**运行方式**:

```bash
cd cms
npm run seed:navigation
```

**前提条件**:

1. 数据库必须已经运行并可访问
2. 数据库 schema 必须是最新的（运行过迁移）
3. Keystone 必须已构建

**完整流程（首次运行）**:

```bash
# 1. 确保数据库运行（Docker）
docker-compose up -d postgres

# 2. 运行数据库迁移
cd cms
npm run migrate

# 注意：这需要交互式终端，会提示输入迁移名称
# 输入类似: update_navigation_menu_schema

# 3. 运行种子脚本
npm run seed:navigation
```

**输出示例**:

```
🚀 Starting navigation menu seed...

📋 Step 1: Creating top-level menus...
  ✅ Created: Home
  ✅ Created: Product
  ✅ Created: Shop
  ✅ Created: Service
  ✅ Created: About Us
  ✅ Created: Contact Us

📋 Step 2: Creating Product series submenu...
  ✅ Created: Product > Glass Standoff
  ✅ Created: Product > Glass Connected Fitting
  ...

==================================================
✨ Navigation menu seed completed!
==================================================
📊 Summary:
   ✅ Created: 35 items
   ⏭️  Skipped: 0 items (already exist)
   📝 Total:   35 items
==================================================
```

**特性**:

- ✅ 幂等性：可以多次运行，不会创建重复数据
- ✅ 智能跳过：自动跳过已存在的菜单项
- ✅ 多语言：包含 24 种语言的翻译
- ✅ 系统保护：核心菜单标记为 `isSystem: true`

---

### 2. Deploy Setup (部署设置脚本)

**脚本**: `deploy-setup.sh`

**用途**: AWS 部署时的一键设置脚本

**运行方式**:

```bash
cd cms
bash scripts/deploy-setup.sh
```

**执行步骤**:

1. 安装依赖 (`npm ci`)
2. 生成 Prisma client
3. 运行数据库迁移
4. 构建 Keystone
5. 生成导航菜单数据
6. 生成其他种子数据（可配置）

**环境变量要求**:

```bash
DATABASE_URL="postgresql://..."
SESSION_SECRET="..."
AWS_S3_BUCKET_NAME="..."
AWS_REGION="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

---

## 🚨 常见问题

### Q1: 种子脚本报错 "column does not exist"

**原因**: 数据库 schema 过期

**解决方案**:

```bash
# 运行数据库迁移
cd cms
npm run migrate
# 输入迁移名称，如: update_schema

# 然后重新运行种子脚本
npm run seed:navigation
```

### Q2: 种子脚本报错 "GraphQLError"

**原因**: Keystone schema 未构建或过期

**解决方案**:

```bash
cd cms
npm run build
npm run seed:navigation
```

### Q3: 如何重新生成所有导航菜单？

**方式 1: 删除现有数据（危险）**

```sql
-- 连接到数据库
psql -U busrom_dev -d busrom_cms

-- 删除所有导航菜单
DELETE FROM "NavigationMenu";

-- 退出
\q
```

然后重新运行：

```bash
npm run seed:navigation
```

**方式 2: 使用 Keystone Admin UI**

1. 访问 http://localhost:3000/admin
2. 进入 "Navigation Menus"
3. 选择要删除的菜单项
4. 点击删除

注意：`isSystem: true` 的菜单无法在 UI 中删除

### Q4: 部署到 AWS 后如何运行种子脚本？

**方式 1: 使用部署脚本（推荐）**

```bash
# SSH 到 EC2
ssh -i key.pem ec2-user@your-ip

# 运行部署脚本
cd /path/to/busrom/cms
bash scripts/deploy-setup.sh
```

**方式 2: 手动运行**

```bash
# SSH 到 EC2
ssh -i key.pem ec2-user@your-ip

# 进入项目目录
cd /path/to/busrom/cms

# 运行种子脚本
npm run seed:navigation
```

### Q5: 如何添加新的菜单项到种子脚本？

编辑 `scripts/seed-navigation-menus.ts`:

**添加新的产品系列**:

```typescript
const PRODUCT_SERIES = [
  // ... 现有系列
  {
    slug: 'new-series',
    nameEn: 'New Series',
    nameZh: '新系列'
  },
]
```

**添加新的服务子菜单**:

```typescript
const SERVICE_SUBMENU = [
  // ... 现有菜单
  {
    identifier: 'service-new',
    parentIdentifier: 'service',
    name: {
      en: 'New Service',
      'zh-CN': '新服务',
    },
    type: 'STANDARD',
    icon: 'Star',
    link: '/service/new',
    order: 5,
  },
]
```

然后重新运行：

```bash
npm run seed:navigation
```

---

## 📝 维护指南

### 脚本文件位置

```
cms/
├── scripts/
│   ├── README.md  (本文件)
│   ├── deploy-setup.sh  (部署脚本)
│   └── seed-navigation-menus.ts  (导航菜单种子数据)
└── package.json  (包含 npm scripts)
```

### 添加新的种子脚本

1. 在 `cms/scripts/` 目录创建新脚本
2. 使用 TypeScript 编写
3. 遵循现有脚本的结构
4. 在 `package.json` 中添加 npm script
5. 在本 README 中添加文档

**模板**:

```typescript
import { getContext } from '@keystone-6/core/context'
import * as PrismaModule from '.prisma/client'
import config from '../keystone'

async function main() {
  console.log('🚀 Starting seed...\n')

  const context = getContext(config, PrismaModule)

  try {
    // 你的种子逻辑

    console.log('✨ Seed completed!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await context.prisma.$disconnect()
  }
}

main()
```

### 在 package.json 中添加 script

```json
{
  "scripts": {
    "seed:your-script": "tsx scripts/your-script.ts"
  }
}
```

---

## 🔗 相关文档

- [部署和数据初始化指南](../../docs/部署和数据初始化指南.md)
- [导航菜单配置说明](../../docs/导航菜单配置说明.md)
- [数据模型与架构](../../docs/01-数据模型与架构.md)

---

**文档版本**: v1.0
**最后更新**: 2025-11-04
**维护者**: 开发团队
