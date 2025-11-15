# Debug FormSubmission 500 Error

## 问题

提交表单时收到 500 Internal Server Error

```
POST http://localhost:3001/api/form-submissions
Status: 500 Internal Server Error
```

## 可能的原因

### 1. FormSubmission 模型未在 Keystone 中注册

**检查**: 确认 `cms/schema.ts` 中已导入并添加 FormSubmission

```typescript
import { FormSubmission } from './schemas/FormSubmission'

export const lists = {
  // ...
  FormSubmission,  // ✅ 必须存在
}
```

### 2. Keystone 服务器未重启

**解决**: 重启 CMS 服务器以加载新的 schema

```bash
cd cms
npm run dev  # 或 yarn dev
```

### 3. GraphQL Schema 未同步

**检查**: 访问 `http://localhost:3000/api/graphql` (Keystone GraphQL Playground)

尝试运行查询:
```graphql
query {
  formSubmissions {
    id
    formName
  }
}
```

如果提示 "Unknown type FormSubmissions",说明 schema 未正确加载。

### 4. API Route 错误

**检查**: `web/app/api/form-submissions/route.ts`

常见问题:
- GraphQL mutation 语法错误
- 变量类型不匹配
- Enum 值拼写错误

## 调试步骤

### 步骤 1: 查看 Next.js 服务器日志

在运行 `npm run dev` 的终端中查看错误信息。

### 步骤 2: 添加更详细的日志

编辑 `web/app/api/form-submissions/route.ts`,添加日志:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Received form submission:', body)

    const { data: result, errors } = await keystoneClient.mutate({
      mutation: CREATE_FORM_SUBMISSION,
      variables: {
        // ...
      },
    })

    if (errors) {
      console.error('❌ GraphQL errors:', JSON.stringify(errors, null, 2))
      // ...
    }

    console.log('✅ Form submitted successfully:', result)
    return NextResponse.json({
      success: true,
      submission: result.createFormSubmission,
    })
  } catch (error) {
    console.error('💥 Form submission API error:', error)
    // ...
  }
}
```

### 步骤 3: 测试 GraphQL Mutation 直接在 Keystone

访问 `http://localhost:3000/api/graphql`,运行:

```graphql
mutation TestFormSubmission {
  createFormSubmission(
    data: {
      formName: "test-form"
      data: { Name: "Test User", Email: "test@example.com" }
      locale: "en"
      status: "UNREAD"
      autoSubmitted: "MANUAL"
    }
  ) {
    id
    formName
    status
  }
}
```

如果这个成功,说明问题在前端 API Route。
如果失败,说明问题在 Keystone schema 定义。

### 步骤 4: 检查数据库

```bash
cd cms
npx prisma studio
```

查看 FormSubmission 表是否存在。

## 常见错误修复

### 错误 1: "Cannot query field 'createFormSubmission'"

**原因**: FormSubmission 未在 schema.ts 中注册

**修复**:
```typescript
// cms/schema.ts
import { FormSubmission } from './schemas/FormSubmission'

export const lists = {
  // ...
  FormSubmission,  // 添加这行
}
```

然后重启 CMS 服务器。

### 错误 2: "Enum 'FormSubmissionAutoSubmittedType' not found"

**原因**: GraphQL enum 名称可能不匹配

**修复**: 检查 API Route 中的 enum 值:

```typescript
// 应该是:
autoSubmitted: autoSubmitted ? 'AUTO' : 'MANUAL'

// 而不是:
autoSubmitted: autoSubmitted ? 'auto' : 'manual'
```

### 错误 3: "Field 'formConfig' type mismatch"

**原因**: formId 可能为 null 但 schema 期望 ID

**修复**: 确保 API Route 正确处理可选字段:

```typescript
formConfig: $formId ? { connect: { id: $formId } } : null
```

## 解决方案

如果以上步骤都检查过了,最可能的问题是:

1. **Keystone 服务器未重启** - 必须重启才能加载新的 schema
2. **GraphQL 客户端缓存** - 尝试清除浏览器缓存或重启 Next.js 服务器

## 验证修复

提交表单后,应该:
1. 在 Next.js 控制台看到成功日志
2. 在 CMS 后台的 Form Submissions 中看到新记录
3. 返回给前端的响应包含 `success: true`

## 需要帮助?

如果问题仍未解决,请提供:
1. Next.js 服务器的完整错误日志
2. Keystone 服务器的错误日志(如果有)
3. 浏览器控制台的错误信息
