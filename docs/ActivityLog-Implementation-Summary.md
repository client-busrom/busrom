# ActivityLog 系统实施总结

## 📋 概述

已成功为 Busrom CMS 实施完整的 ActivityLog（操作日志）审计系统，用于追踪所有重要的内容管理操作。

## ✅ 已完成的功能

### 1. 核心日志系统

#### ActivityLog 模型 (`cms/schemas/ActivityLog.ts`)
- ✅ 记录所有 CRUD 操作（创建/更新/删除）
- ✅ 追踪用户信息、IP 地址、User Agent
- ✅ 存储变更详情（before/after 对比）
- ✅ 只读界面配置（防止篡改日志）
- ✅ 管理员专属访问权限

**字段说明：**
- `user`: 执行操作的用户
- `action`: 操作类型（create/update/delete/login/logout）
- `entity`: 实体类型（如 "Product", "Blog"）
- `entityId`: 被操作对象的 ID
- `changes`: JSON 格式的变更内容（显示 from → to）
- `ipAddress`: 请求的 IP 地址
- `userAgent`: 浏览器/设备信息
- `timestamp`: 操作时间

#### Activity Logger 工具库 (`cms/lib/activity-logger.ts`)
- ✅ 智能变更检测（自动对比 before/after）
- ✅ 敏感数据过滤（密码、完整脚本等）
- ✅ 非阻塞设计（日志失败不影响业务）
- ✅ 实体特定字段提取
- ✅ 自动类型转换（支持数字 ID）

**核心函数：**
```typescript
logActivity(context, operation, entity, item, changes?, originalItem?)
logCreate(context, entity, item, changes?)
logUpdate(context, entity, item, changes?, originalItem?)
logDelete(context, entity, item, changes?)
```

### 2. 已实施 ActivityLog 的模型

#### P0 高优先级（11个）✅

1. **SiteConfig** - 全站配置操作
   - 记录所有配置更改
   - 过滤 SMTP 密码等敏感数据

2. **CustomScript** - 代码注入安全审计
   - 记录脚本的启用/禁用状态
   - 不记录完整脚本内容（避免日志过大）

3. **Product** - 产品管理
   - 记录 SKU、名称、状态、特色标记的变更

4. **ProductSeries** - 产品系列
   - 记录系列的基本信息变更

5. **Blog** - 博客文章
   - 记录标题、内容、状态的变更

6. **Application** - 应用案例
   - 记录案例的基本信息变更

7. **Page** - 页面管理
   - 记录页面的标题、slug、状态变更

8. **Media** - 媒体文件
   - 记录上传和删除操作
   - 记录文件名、大小、类型

9. **SeoSetting** - SEO 配置
   - 记录 SEO 设置的变更

10. **NavigationMenu** - 导航菜单
    - 记录菜单的启用/禁用、顺序变更

11. **ContactForm** - 联系表单
    - 记录表单提交的删除操作

#### P1 中优先级（4个）✅

12. **Footer** - 页脚配置
    - 记录页脚内容的更新

13. **FormConfig** - 表单配置
    - 记录表单字段配置的变更

14. **Category** - 分类管理
    - 记录分类的创建/更新/删除

15. **FaqItem** - FAQ 项目
    - 记录 FAQ 的创建/更新
    - 注：物理删除已禁用，只记录状态变更

## 🔒 安全特性

### 1. 只读日志
- ❌ 无法修改已创建的日志
- ❌ 无法通过 UI 创建日志（系统自动创建）
- ❌ 无法通过 UI 删除日志（防止误删）
- ✅ 所有字段在详情页面只读

### 2. 敏感数据保护
自动过滤以下敏感数据：
- SMTP 密码
- 完整的脚本内容（CustomScript）
- 其他认证凭证

### 3. 访问控制
- 只有管理员（`isAdmin: true`）可以查看日志
- 系统级操作（无 session）不记录日志
- 普通用户无法看到 ActivityLog 菜单

## 📊 变更记录格式

### 更新操作的变更格式
```json
{
  "id": "1",
  "companyName": {
    "from": {"en": "Busrom Company1"},
    "to": {"en": "Busrom Company2"}
  },
  "email": {
    "from": "old@busrom.com",
    "to": "new@busrom.com"
  }
}
```

### 创建操作的变更格式
```json
{
  "id": "clx...",
  "sku": "PROD-001",
  "name": {"en": "New Product"},
  "status": "DRAFT"
}
```

### 删除操作的变更格式
```json
{
  "id": "clx...",
  "filename": "image.jpg",
  "filesize": 102400,
  "mimeType": "image/jpeg"
}
```

## 🎯 使用方式

### 在模型中添加 ActivityLog

```typescript
export const YourModel = list({
  fields: {
    // ... your fields
  },

  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if ((operation === 'create' || operation === 'update' || operation === 'delete') && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation, 'YourModel', item, undefined, originalItem)
      }
    },
  },
})
```

### 查看日志

1. 以管理员身份登录 CMS
2. 在侧边栏找到 "Users & Access" 分组
3. 点击 "Activity Log"
4. 查看操作历史记录

### 日志列显示
- User（用户）
- Action（操作类型）
- Entity（实体类型）
- Timestamp（时间戳）

## 🧪 测试建议

### 基本测试流程

1. **Product 测试**
   - 创建新产品 → 检查 ActivityLog
   - 修改产品价格 → 检查变更记录（from/to）
   - 删除产品 → 检查删除记录

2. **SiteConfig 测试**
   - 修改公司名称
   - 检查是否记录了正确的 from/to 值
   - 确认敏感字段（如 SMTP 密码）未被记录

3. **CustomScript 测试**
   - 创建新脚本
   - 启用/禁用脚本
   - 检查是否记录但不包含完整脚本内容

4. **Media 测试**
   - 上传文件 → 检查创建记录
   - 删除文件 → 检查删除记录

## 📈 性能优化

1. **非阻塞设计**
   - 日志失败不会影响业务操作
   - 使用 try-catch 捕获错误

2. **动态导入**
   ```typescript
   const { logActivity } = await import('../lib/activity-logger')
   ```
   - 减少启动时间
   - 按需加载

3. **智能字段提取**
   - 只记录必要的字段
   - 过滤大型内容（如完整 HTML）

## 🔧 故障排除

### 问题：日志没有创建

**检查项：**
1. 是否以登录用户身份操作？（`context.session.itemId` 必须存在）
2. 是否是管理员？（查看 ActivityLog 需要管理员权限）
3. 检查后端日志是否有错误信息

### 问题：变更内容显示不正确

**原因：**
- 如果只传递 `item` 而不传递 `originalItem`，会使用默认的字段提取逻辑

**解决方案：**
```typescript
// ✅ 正确：传递 originalItem
await logActivity(context, 'update', 'Product', item, undefined, originalItem)

// ❌ 错误：缺少 originalItem
await logActivity(context, 'update', 'Product', item)
```

### 问题：EntityId 类型错误

**错误信息：**
```
String cannot represent a non string value: 1
```

**原因：**
- SiteConfig 等模型的 ID 是数字类型
- ActivityLog 的 `entityId` 字段是 text 类型

**解决方案：**
- 已在 `activity-logger.ts` 中使用 `String(item.id)` 自动转换

## 📝 后续优化建议

### 1. 登录/登出日志
在 User 模型中添加登录/登出事件的记录：
```typescript
// 登录成功后
await logActivity(context, 'login', 'User', user)

// 登出时
await logActivity(context, 'logout', 'User', user)
```

### 2. 日志归档
定期清理旧日志（建议保留 6-12 个月）：
```typescript
// 创建定时任务
async function archiveOldLogs() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  await context.db.ActivityLog.deleteMany({
    where: {
      timestamp: { lt: sixMonthsAgo }
    }
  })
}
```

### 3. 日志导出
添加导出功能，方便审计：
- CSV 导出
- JSON 导出
- 按日期范围筛选

### 4. 日志分析
创建分析面板：
- 最活跃用户
- 最常修改的内容
- 操作趋势图表

## 🎉 总结

ActivityLog 系统已全面部署到 **15 个核心模型**，覆盖：
- ✅ 内容管理（Blog、Page、Media）
- ✅ 产品管理（Product、ProductSeries）
- ✅ 系统配置（SiteConfig、CustomScript、SeoSetting）
- ✅ 表单管理（ContactForm、FormConfig、Footer）
- ✅ 基础数据（Category、FaqItem、NavigationMenu、Application）

系统特性：
- 🔒 **安全可靠** - 只读日志，防篡改
- 🎯 **精准追踪** - Before/After 对比
- 🚀 **性能优化** - 非阻塞设计
- 🛡️ **隐私保护** - 自动过滤敏感数据

现在你可以完整追踪 CMS 中的所有重要操作，满足审计和合规要求！
