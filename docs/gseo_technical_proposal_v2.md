# Busrom GEO & GSEO 自动化增强系统：全流程技术方案 (V2.0)

## 1. 战略定位：从“SEO 录入”到“GSEO 信号流水线”
本项目旨在将传统的地理定位 (GEO) 与现代生成式搜索优化 (GSEO) 融合。通过 AI 提炼出高事实密度的内容，以 JSON-LD 结构化数据的形式静默注入 Head，旨在提升 AI 搜索引擎（Perplexity, SearchGPT, Gemini）的引用率与权威得分。

---

## 2. 现状审计与体系补全计划 (Status & Gap Filling)
针对甲方核心审计要求，本项目将在实施过程中完成以下补全：

| 审计项 | 现状 (Current) | 补全计划 (Action Plan) |
| :--- | :--- | :--- |
| **渲染能力** | 已支持 Next.js SSR/SSG。 | **维持并优化**：确保所有动态内容在服务端完成脱水，避免关键内容只在客户端渲染。 |
| **语义标签** | 仅具备基础 Title/Desc。 | **补全计划**：自动化集成 Canonical, Open Graph, Twitter Card, Robots, Hreflang 等高级标签。 |
| **GSEO 镜像** | 24 语种 URL 独立，但无交叉引用标记。 | **补全计划**：在 `<head>` 注入全语种 Hreflang 交叉引用标签映射，建立准确的“语言镜像”引用链路。 |
| **数据一致性**| 暂无 JSON-LD 事实对齐。 | **强制标准**：所有 JSON-LD 必须与正文可见内容一致，严禁虚构 FAQ 或 Review。 |
| **Sitemap/Robots** | 已自动化生成。 | **完善计划**：完善可抓取内链，增强 Robots/Noindex 控制与页面路径导航结构的完整性。 |
| **架构颗粒度** | 现有架构已有支持。 | **升级计划**：将 GeoSettings 拆分为页面级、语种级、地区级配置，并保留 AI 提炼证据链。 |

---

## 3. 核心技术流 (The Pipeline)

### 第一阶段：多维数据脱水与事实锚定
- **事实源 (Evidences)**：读取页面的 Lexical JSON 内容。**核心准则**：AI 生成的结构化数据必须锚定脱水后的正文事实，确保真实性。
- **意图源 (Targets)**：利用 PayloadCMS 已开启的 Canonical 选项，结合 SeoSettings 导出长尾词分布。

### 第二阶段：AI 专家提炼 (Locale-Aware Skill)
- **环境感知**：Gemini 1.5 Flash 优先阅读原生语种正文。
- **差异化打法**：根据运营设置的 `StrategyOverride`，动态调整生成内容的侧重点（精锐模式 vs 标准模式）。

### 第三阶段：多语言同步与“三级拆分”存储
- **存储架构**：在数据库层将 `GeoSettings` 细化为：
  - **页面级**：针对特定路径的 GSEO。
  - **语种级**：针对不同语言文化的表达差异。
  - **地区级**：针对不同国家/地区的本地化配置。
- **分发**：支持 Translation Center 一键同步至 24 语种，允许按重点语种人工/AI 独立调优。

### 第四阶段：前端无侵入注入 (Zero-Touch Frontend)
- **GeoInjector.tsx**：在全局 `LanguageLayout` 或 `PageSeoInjector` 中自动注入：
  - `meta[name="geo.*"]` (地缘元数据)
  - `FAQPage` / `LocalBusiness` / `Review` JSON-LD (生成式回答核心)
  - 全语种 `hreflang` 映射逻辑。

---

## 4. 运营管理体验
1.  **指令配置**：在 `GseoAiConfig` 中配置主 Prompt 模板及地域倾向。
2.  **内容录入**：在 `GeoSettings` 中设定页面级、语种级或地区级的“主打策略”。
3.  **AI 协作**：点击 `[AI 精准提炼]`，实时获得建议内容，人工审核后一键分发。

---

## 5. 实施工作量评估 (Person-Days)

| 模块                      | 具体任务                                                     | 预估工时     |
| :------------------------ | :----------------------------------------------------------- | :----------- |
| **A. 基础架构 (Backend)** | 创建三级拆分的 `GeoSettings`、`GseoAiConfig` 全局配置。       | 0.8 人日     |
| **B. AI 提炼引擎**        | 编写 Lexical 脱水脚本、Gemini API 代理、事实校验逻辑。         | 2.0 人日     |
| **C. 自动化流集成**       | 与 Translation Center 钩子打通，支持 24 语种镜像同步。       | 1.0 人日     |
| **D. 前端注入层**         | 实现全局 `GeoInjector`、JSON-LD 及全语义标签 (Canonical/Hreflang) 注入。 | 2.0 人日     |
| **E. 提示词调优与 QA**    | 24 语种边界测试、Google Schema 校验、AI 提示词微调。         | 1.2 人日     |
| **总计**                  |                                                              | **7.0 人日** |
