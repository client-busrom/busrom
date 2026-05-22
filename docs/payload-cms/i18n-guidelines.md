# CMS Admin UI 多语言规范

## 概述

本项目使用 Payload CMS 内置的 i18n 系统来管理 admin UI 的多语言。所有界面文字必须支持多语言，避免硬编码。

## 两种多语言方式

### 1. Collection/Global 配置中的 label 和 description

Payload 原生支持在字段配置中直接使用多语言对象：

```typescript
{
  name: 'productName',
  type: 'text',
  label: {
    en: 'Product Name',
    zh: '产品名称',
  },
  admin: {
    description: {
      en: 'Enter the product name',
      zh: '输入产品名称',
    },
  },
}
```

**适用范围：**
- `label` - 字段标签
- `description` - 字段描述
- `labels.singular` / `labels.plural` - Collection 名称
- `admin.group` - 分组名称
- `options[].label` - Select 选项标签
- `tabs[].label` - Tab 标签

### 2. 自定义组件中的翻译

对于自定义 React 组件，使用 Payload 的 `useTranslation` hook：

```typescript
import { useTranslation } from '@payloadcms/ui'

const MyComponent = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('custom:myComponent:title')}</h1>
      <p>{t('custom:myComponent:description', { count: 5 })}</p>
    </div>
  )
}
```

## 文件结构

```
src/
  i18n/
    admin-labels.ts       # 可复用的标签常量（可选）
    custom-translations.ts # 自定义组件翻译
```

## 翻译文件格式

### src/i18n/custom-translations.ts

```typescript
export const customTranslationsEn = {
  custom: {
    myComponent: {
      title: 'My Component',
      description: 'This has {{count}} items',
    },
  },
}

export const customTranslationsZh = {
  custom: {
    myComponent: {
      title: '我的组件',
      description: '共有 {{count}} 个项目',
    },
  },
}
```

### payload.config.ts 配置

```typescript
import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'
import { customTranslationsEn, customTranslationsZh } from './src/i18n/custom-translations'

export default buildConfig({
  i18n: {
    supportedLanguages: {
      en: { ...en, ...customTranslationsEn },
      zh: { ...zh, ...customTranslationsZh },
    },
    fallbackLanguage: 'en',
  },
})
```

## 规范要求

### ✅ 必须做

1. **Collection 配置中的所有用户可见文字必须多语言**
   - `label`
   - `description`
   - `options[].label`
   - `tabs[].label`
   - `labels.singular/plural`
   - `admin.group`

2. **自定义组件中的所有文字必须使用 `t()` 函数**

3. **添加新翻译时同时添加 en 和 zh**

### ❌ 禁止做

1. 硬编码字符串：`<button>Submit</button>`
2. 只写一种语言：`label: 'Name'`
3. 使用管道分隔：`label: 'Name | 名称'`（旧写法，应迁移）

## 命名规范

翻译键使用冒号分隔的命名空间：

```
custom:componentName:keyName

例如：
custom:translationCenter:title
custom:mediaPicker:selectMedia
custom:fields:productName
```

## 示例

### Collection 字段

```typescript
// ✅ 正确
{
  name: 'status',
  type: 'select',
  label: {
    en: 'Status',
    zh: '状态',
  },
  options: [
    { label: { en: 'Published', zh: '已发布' }, value: 'published' },
    { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
  ],
  admin: {
    description: {
      en: 'Select the publication status',
      zh: '选择发布状态',
    },
  },
}

// ❌ 错误
{
  name: 'status',
  type: 'select',
  label: 'Status',
  options: [
    { label: 'Published | 已发布', value: 'published' },
  ],
  admin: {
    description: 'Select the publication status',
  },
}
```

### 自定义组件

```typescript
// ✅ 正确
const { t } = useTranslation()
return <button>{t('custom:actions:save')}</button>

// ❌ 错误
return <button>Save</button>
return <button>保存</button>
```

## 添加新语言

如需支持新语言（如日语）：

1. 在 `custom-translations.ts` 中添加 `customTranslationsJa`
2. 在 `payload.config.ts` 中导入并配置
3. 确保所有翻译键都有对应的日语翻译

## 后续提示语

在与 Claude 对话时，可以使用以下提示确保遵循规范：

> "请遵循 docs/i18n-guidelines.md 中的多语言规范，所有界面文字必须支持 en 和 zh 两种语言，不要硬编码。"

或简短版：

> "遵循 i18n 规范，所有文字需要 en/zh 多语言支持。"
