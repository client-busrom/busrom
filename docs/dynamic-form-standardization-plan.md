# 动态表单渲染系统标准化实施计划 (Dynamic Form Standardization Plan)

## 记录日期：2026-04-20 (Updated: 2026-04-21)

### 1. 核心目标 (Core Objectives)
实现表单数据的 **SSR 预填充 (SSR Enrichment)**，消除客户端二次拉取的闪烁感，并确保 1：1 还原 Premium 设计中的动态字段渲染逻辑。

### 2. 标准 Lexical 标记规则
为了在服务端精准识别表单位置，CMS 内容必须遵循：
1.  **Marker 节点**：一个内容为 `"contact-form-block"` 的段落/引用节点（Format 为 16 或纯文本）。
2.  **Target 节点**：紧随 Marker 后的第一个 `type: "formBlock"` 节点。

### 3. 公共补全函数逻辑 (Enrichment Logic in pages.ts)
在 `web/lib/api/pages.ts` 的 `fetchPageData` 中执行：
-   **识别**：扫描 Lexical 树，定位所有 `contact-form-block` 标记对。
-   **拉取**：根据 `node.data.formConfig.id` 发起 `depth=2` 的 API 请求。
-   **原地注入**：将拉取到的 Full Object 直接覆盖回 `node.data.formConfig`。
-   **优势**：解析器生成的 Data 对象中将直接包含完整的 `fields` 数组。

### 4. 解析器标准化 (Parser Standard)
所有页面的 Parser (如 `application-parser.ts`) 应遵循：
```typescript
const nodes = extractNodesAfterMarker(children, "contact-form-block");
const formNode = nodes.find(n => n.type === 'formBlock');
return {
  ...
  contactForm: {
    formConfig: formNode?.data?.formConfig, // 这里已是完整对象
    ...
  }
}
```

### 5. 组件开发规范 (Component Standards)
参照 `FaqContactSection.tsx` 实现：
-   **Props 传递**：直接从解析后的 `data.formConfig` 接收配置。
-   **无硬编码**：使用 `formConfig.fields.map` 渲染，严禁在组件内写死字段名。
-   **功能集成**：
    -   上传：使用 `/api/form-file-upload`（需处理上传状态和预览名）。
    -   提交：POST 至 `/api/form-submissions`。
    -   UI 组件：统一使用 `@/components/ui/` 下的 `PhoneInput`, `CustomDropdown`。
-   **适配**：全量使用 `vw` 单位，并确保 `placeholder` 及 `hover` 状态符合设计规范。

### 6. 全量同步进度
- [x] FAQ 试点 (Trial)
- [ ] Application Section (Priority)
- [ ] One-Stop Solution
- [ ] Support / Story / Contact Us

