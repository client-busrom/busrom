# 动态表单渲染系统标准化实施计划 (Dynamic Form Standardization Plan)

## 记录日期：2026-04-20

### 1. 核心目标 (Core Objectives)
解决目前应用各处表单数据加载不统一、SSR 漏缺字段的问题。建立一套基于标记（Marker）识别、服务器端自动补齐（SSR Enrichment）的标准化流水线。

### 2. 标准 Lexical 数据结构识别规则
所有表单块在 CMS 的富文本编辑器中应遵循以下标记顺序：
1. **标记段落**：`type: "paragraph"`，其子节点包含纯文本 `"contact-form-block"`。
2. **目标表单块**：紧随其后的 `type: "formBlock"`，其 `data.formConfig.id` 是我们要补全的对象 ID。

### 3. 公共补全函数逻辑 (Common Enrichment Function)
在 `fetchPageData` (服务器端函数) 中引入统一补全逻辑：
- **函数名建议**：`populateLexicalFormConfigs`
- **逻辑流**：
    - 递归遍历页面 Lexical 树。
    - 匹配 `contact-form-block` 后的第一个 `formBlock`。
    - 采集 `formId`。
    - 发起 API 调用：`${cmsUrl}/api/form-configs/${id}?depth=2&draft=false&locale=${locale}`。
    - **原地覆盖**：将 `node.data.formConfig` 从 ID 字符串/简略对象，覆盖为拉取到的 Full Object。

### 4. 分步实施计划 (Implementation Steps)

#### 阶段一：试点实施 (Trial: FAQ Page)
- **目标文件**：
    - `web/lib/api/pages.ts`: 实现公共拉取逻辑。
    - `web/lib/parsers/faq-parser.ts`: 修改解析逻辑，根据 Marker 提取数据。
    - `web/components/faq/sections/ContactFormSection.tsx`: 实现全动态渲染，删除硬编码字段。
- **验证**：确保 FAQ 页面源代码中直接包含 Form Label 和 Placeholder。

#### 阶段二：全量同步 (Rollout)
在 FAQ 试点成功后，将以下页面按照相同模式重构：
- **One-Stop Solution** (`one-stop-solution-parser.ts` + `CtaSection.tsx`)
- **Support** (`support-parser.ts` + `SupportContactFormSection.tsx`)
- **Application** (`application-parser.ts` + `ApplicationContactFormSection.tsx`)
- **Our Story** (`our-story-parser.ts` + `StoryContactFormSection.tsx`)
- **Contact Us** (`contact-us-parser.ts` + `ContactFormSection.tsx`)

### 5. 关键代码规范 (Code Standards)
- **No Hardcoding**：组件内严禁出现针对 `fieldName === "email"` 等具体字段的 fallback 文本。
- **Depth 2**：所有表单数据的拉取深度强制为 2，以获取完整的字段配置。
- **getTranslation**：统一使用该 helper 处理所有 CMS 返回的多语言字段。
