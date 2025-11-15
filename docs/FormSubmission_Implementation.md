# Form Submission Implementation Guide

## 概述

实现了完整的动态表单提交系统,允许用户通过产品详情页的询盘表单提交数据。

## 已完成的工作

### 1. 创建 FormSubmission Schema

**文件**: `cms/schemas/FormSubmission.ts`

**功能**:
- 存储所有通过 FormConfig 配置的动态表单提交
- 支持JSON格式存储任意表单字段
- 跟踪提交状态 (UNREAD/READ/ARCHIVED)
- 区分手动提交和自动提交
- 记录元数据 (locale, IP, user agent, source page等)
- 关联到 FormConfig

**字段**:
- `formConfig`: 关联的表单配置
- `formName`: 表单名称(冗余字段,方便查看)
- `data`: JSON格式的表单数据
- `status`: 提交状态
- `autoSubmitted`: 手动/自动提交标记
- `locale`: 提交时的语言
- `sourcePage`: 来源页面URL
- `ipAddress`: IP地址
- `userAgent`: 浏览器信息
- `adminNotes`: 管理员备注
- `submittedAt`: 提交时间
- `readAt`: 阅读时间
- `updatedAt`: 更新时间

### 2. 创建前端 API Route

**文件**: `web/app/api/form-submissions/route.ts`

**功能**:
- 接收前端POST请求
- 验证表单数据
- 获取请求元数据 (IP, User Agent, Referer)
- 转换为GraphQL mutation
- 调用Keystone API创建表单提交记录
- 返回结果给前端

**请求格式**:
```json
{
  "formId": "be109138-9057-4a52-8857-da94d9d49055",
  "formName": "product-inquiry-form",
  "data": {
    "Name": "John Doe",
    "Email": "john@example.com",
    "PhoneNumber": "+1234567890",
    "InquiryProduct": ["glass-standoff", "others"],
    "Customize": "Custom size requirements..."
  },
  "locale": "en",
  "autoSubmitted": false
}
```

**响应格式**:
```json
{
  "success": true,
  "submission": {
    "id": "xxx",
    "formName": "product-inquiry-form",
    "status": "UNREAD",
    "submittedAt": "2025-11-15T05:25:48Z"
  }
}
```

### 3. 创建 JSONField 自定义字段

**文件**: `cms/custom-fields/JSONField.tsx`

**功能**:
- 在CMS后台以表格形式显示表单数据
- 支持数组字段的友好显示
- 提供原始JSON查看功能
- 只读模式

### 4. 更新 Schema 配置

**文件**: `cms/schema.ts`

**修改**:
- 导入 FormSubmission schema
- 添加到 lists 对象

## 需要执行的步骤

### 步骤 1: 运行数据库迁移

在终端中执行以下命令:

```bash
cd cms
npx prisma migrate dev --name add_form_submission
```

这将:
1. 创建 `FormSubmission` 表
2. 生成迁移文件
3. 应用到数据库

### 步骤 2: 重启 CMS 服务器

如果CMS正在运行,需要重启以加载新的schema:

```bash
# 如果使用 npm
npm run dev

# 或者 yarn
yarn dev
```

### 步骤 3: 测试表单提交

1. 访问产品详情页: `http://localhost:3001/en/shop/glass_standoff_test_red`
2. 填写简化表单
3. 点击 "Submit Inquiry"
4. 填写完整表单
5. 提交

### 步骤 4: 在 CMS 后台查看提交

1. 访问CMS后台
2. 导航到 "Form Submissions"
3. 查看新的提交记录
4. 点击记录查看详细的表单数据

## 数据流程

```
用户填写表单
    ↓
FullInquiryModal.tsx (前端组件)
    ↓
POST /api/form-submissions (Next.js API Route)
    ↓
GraphQL Mutation (Apollo Client)
    ↓
Keystone CMS (createFormSubmission)
    ↓
PostgreSQL Database
    ↓
CMS后台可查看 (Form Submissions 菜单)
```

## GraphQL Schema

迁移后会生成以下GraphQL类型:

```graphql
type FormSubmission {
  id: ID!
  formConfig: FormConfig
  formName: String
  data: JSON
  status: FormSubmissionStatusType!
  autoSubmitted: FormSubmissionAutoSubmittedType!
  locale: String
  sourcePage: String
  ipAddress: String
  userAgent: String
  adminNotes: String
  submittedAt: DateTime
  readAt: DateTime
  updatedAt: DateTime
}

enum FormSubmissionStatusType {
  UNREAD
  READ
  ARCHIVED
}

enum FormSubmissionAutoSubmittedType {
  MANUAL
  AUTO
}
```

## 示例数据

### 提交到数据库的数据:

```json
{
  "id": "clxxx...",
  "formConfig": {
    "id": "be109138-9057-4a52-8857-da94d9d49055"
  },
  "formName": "product-inquiry-form",
  "data": {
    "Name": "John Doe",
    "Email": "john@example.com",
    "PhoneNumber": "+1234567890",
    "InquiryProduct": [
      "glass-standoff",
      "glass-hinge",
      "others"
    ],
    "Customize": "I need custom size: 100mm x 200mm, matte black finish"
  },
  "status": "UNREAD",
  "autoSubmitted": "MANUAL",
  "locale": "en",
  "sourcePage": "http://localhost:3001/en/shop/glass_standoff_test_red",
  "ipAddress": "::1",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
  "submittedAt": "2025-11-15T05:25:48.000Z"
}
```

## 后续优化

### 1. 邮件通知

可以在 FormSubmission 的 hooks 中添加邮件通知:

```typescript
afterOperation: async ({ operation, item }) => {
  if (operation === 'create' && item) {
    // 发送邮件通知给管理员
    await sendFormSubmissionNotification(item)
  }
}
```

### 2. 导出功能

在CMS后台添加导出功能,允许管理员导出表单提交为CSV/Excel。

### 3. 自动归档

添加定时任务,自动将超过一定时间的已读提交归档。

### 4. 统计面板

创建仪表板显示:
- 今日提交数
- 未读提交数
- 按表单类型统计
- 按时间段统计

## 故障排查

### 问题 1: 404 Not Found

**原因**: API Route 不存在或Next.js未识别

**解决**:
1. 确认文件路径正确: `app/api/form-submissions/route.ts`
2. 重启Next.js开发服务器

### 问题 2: GraphQL Error

**原因**: Schema未同步或迁移未运行

**解决**:
1. 运行 `npx prisma migrate dev`
2. 重启CMS服务器

### 问题 3: CORS Error

**原因**: 前后端域名不匹配

**解决**:
检查Keystone的CORS配置,确保允许前端域名

## 相关文件

- `cms/schemas/FormSubmission.ts` - FormSubmission schema定义
- `cms/custom-fields/JSONField.tsx` - JSON字段显示组件
- `cms/schema.ts` - Schema配置
- `web/app/api/form-submissions/route.ts` - API Route
- `web/components/shop/FullInquiryModal.tsx` - 前端表单组件
