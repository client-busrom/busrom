# FormConfig 与 SiteConfig 的关系

## 概述

系统中有两个地方涉及表单配置：
- **SiteConfig** - 全局默认配置（单例）
- **FormConfig** - 表单级配置（多个）

它们采用**继承+覆盖**的模式，避免重复配置。

## 配置继承逻辑

```
最终使用的值 = FormConfig 覆盖值 || SiteConfig 全局值 || 系统默认值
```

### 示例

假设：
- SiteConfig 中设置了 `formNotificationEmails = "admin@example.com"`
- FormConfig A 没有设置 `notificationEmail` → 使用全局值 `"admin@example.com"`
- FormConfig B 设置了 `notificationEmail = "sales@example.com"` → 使用覆盖值 `"sales@example.com"`

## 字段对应关系

### 1. 邮件通知邮箱

| SiteConfig | FormConfig | 继承逻辑 |
|-----------|-----------|---------|
| `formNotificationEmails` | `notificationEmail` | FormConfig 留空 → 使用 SiteConfig 全局值 |

**使用场景**：
- **全局配置**：所有表单默认发送到 `admin@example.com`
- **表单覆盖**：销售表单单独发送到 `sales@example.com`

### 2. 自动回复开关

| SiteConfig | FormConfig | 继承逻辑 |
|-----------|-----------|---------|
| `enableAutoReply` | `enableAutoReply` | FormConfig 留空 → 使用 SiteConfig 全局值 |

**使用场景**：
- **全局配置**：默认所有表单都启用自动回复
- **表单覆盖**：订阅表单不需要自动回复，单独关闭

### 3. 自动回复模板

| SiteConfig | FormConfig | 继承逻辑 |
|-----------|-----------|---------|
| `autoReplyTemplate` | `autoReplySubject` + `autoReplyContent` | FormConfig 留空 → 使用 SiteConfig 全局模板 |

**使用场景**：
- **全局配置**：通用的"感谢联系我们"模板
- **表单覆盖**：产品咨询表单使用特定的"感谢咨询产品"模板

### 4. 验证码开关

| SiteConfig | FormConfig | 继承逻辑 |
|-----------|-----------|---------|
| `enableCaptcha` | `enableCaptcha` | FormConfig 留空 → 使用 SiteConfig 全局值 |

**使用场景**：
- **全局配置**：所有表单默认启用验证码防止垃圾信息
- **表单覆盖**：内部测试表单关闭验证码方便测试

## 配置策略建议

### 推荐做法 ✅

1. **在 SiteConfig 中配置全局默认值**
   - 大部分表单使用的通用配置
   - 例如：通知邮箱、自动回复模板、验证码开关

2. **在 FormConfig 中只覆盖特殊情况**
   - 只有少数表单需要不同配置时才填写
   - 例如：销售表单单独发送到销售邮箱

3. **保持 FormConfig 配置简洁**
   - 大部分字段留空，使用全局默认值
   - 只在必要时覆盖

### 不推荐做法 ❌

1. ~~每个 FormConfig 都填写所有配置字段~~
   - 违背了继承的目的
   - 维护成本高，修改全局配置时需要逐个更新

2. ~~SiteConfig 留空，所有配置都在 FormConfig 中~~
   - 无法统一管理
   - 配置分散，难以维护

## 实际使用示例

### 场景 1：标准配置（使用全局默认）

**SiteConfig 配置：**
```
formNotificationEmails: "admin@busrom.com"
enableAutoReply: true
autoReplyTemplate: "Thank you for contacting us..."
enableCaptcha: true
```

**FormConfig 配置：**
```
name: "general-contact-form"
notificationEmail: (留空)
enableAutoReply: (留空)
autoReplyContent: (留空)
enableCaptcha: (留空)
```

**实际效果：**
- 通知邮箱：`admin@busrom.com` (来自 SiteConfig)
- 自动回复：启用 (来自 SiteConfig)
- 回复模板：使用全局模板 (来自 SiteConfig)
- 验证码：启用 (来自 SiteConfig)

### 场景 2：特殊表单（覆盖部分配置）

**SiteConfig 配置：**
```
formNotificationEmails: "admin@busrom.com"
enableAutoReply: true
autoReplyTemplate: "Thank you for contacting us..."
enableCaptcha: true
```

**FormConfig 配置（销售表单）：**
```
name: "product-inquiry-form"
notificationEmail: "sales@busrom.com" (覆盖)
enableAutoReply: true
autoReplyContent: "Thank you for your product inquiry..." (覆盖)
enableCaptcha: (留空)
```

**实际效果：**
- 通知邮箱：`sales@busrom.com` (覆盖值)
- 自动回复：启用
- 回复模板：使用产品咨询专用模板 (覆盖值)
- 验证码：启用 (来自 SiteConfig)

### 场景 3：测试表单（关闭验证码）

**SiteConfig 配置：**
```
enableCaptcha: true
```

**FormConfig 配置（测试表单）：**
```
name: "test-form"
enableCaptcha: false (覆盖)
```

**实际效果：**
- 验证码：关闭 (覆盖值，方便测试)

## 前端实现逻辑

在前端提交表单时，应该按照以下优先级获取配置：

```javascript
// 伪代码
async function getFormConfig(formConfigId) {
  const formConfig = await fetchFormConfig(formConfigId)
  const siteConfig = await fetchSiteConfig()

  return {
    notificationEmail: formConfig.notificationEmail || siteConfig.formNotificationEmails,
    enableAutoReply: formConfig.enableAutoReply ?? siteConfig.enableAutoReply,
    autoReplyTemplate: formConfig.autoReplyContent || siteConfig.autoReplyTemplate,
    enableCaptcha: formConfig.enableCaptcha ?? siteConfig.enableCaptcha,
  }
}
```

## FormConfig 字段说明

### 表单行为配置（可选字段）

以下字段都是**可选的**，留空则使用 SiteConfig 中的全局默认值：

| 字段 | 类型 | 说明 | 覆盖的全局配置 |
|-----|------|------|--------------|
| `notificationEmail` | text | 接收此表单通知的邮箱 | `SiteConfig.formNotificationEmails` |
| `enableEmailNotification` | checkbox | 是否发送邮件通知 | - |
| `enableAutoReply` | checkbox | 是否启用自动回复 | `SiteConfig.enableAutoReply` |
| `autoReplySubject` | json | 自动回复邮件主题 | - |
| `autoReplyContent` | json | 自动回复邮件内容 | `SiteConfig.autoReplyTemplate` |
| `enableCaptcha` | checkbox | 是否启用验证码 | `SiteConfig.enableCaptcha` |
| `maxSubmissionsPerDay` | integer | 每日最大提交次数 | - |

### 表单外观配置（必填字段）

以下字段是**必填的**，不从 SiteConfig 继承：

| 字段 | 类型 | 说明 |
|-----|------|------|
| `name` | text | 表单唯一标识 |
| `displayName` | json | 表单显示名称（多语言）|
| `description` | json | 表单描述（多语言）|
| `location` | select | 表单位置（Footer、Home Main 等）|
| `fields` | json | 表单字段配置数组 |
| `submitButtonText` | json | 提交按钮文字（多语言）|
| `successMessage` | json | 成功提示消息（多语言）|
| `errorMessage` | json | 错误提示消息（多语言）|

## 总结

### 设计原则

1. **DRY (Don't Repeat Yourself)**：全局配置一次，多处使用
2. **灵活性**：特殊表单可以覆盖全局配置
3. **可维护性**：修改全局配置，所有表单自动生效
4. **简洁性**：FormConfig 只配置必要的字段

### 配置流程

1. **首次设置**：在 SiteConfig 中配置全局默认值
2. **创建表单**：在 FormConfig 中配置表单字段和外观
3. **特殊需求**：只在需要时覆盖 FormConfig 的行为配置
4. **全局调整**：修改 SiteConfig，所有未覆盖的表单自动更新

这样既避免了配置冲突，又保持了灵活性和可维护性！🎉
