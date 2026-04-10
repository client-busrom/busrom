# Busrom GEO & GSEO 自动化增强系统：全流程技术方案 (V2.0 Revised)

## 1. 战略定位：从“SEO 录入”到“GSEO 信号流水线”
本项目旨在将传统的地理定位 (GEO) 与现代生成式搜索优化 (GSEO) 融合。通过 AI 提炼出高事实密度的内容，以 JSON-LD 结构化数据的形式静默注入 Head，从而在不改动现有前端组件的前提下，提升 AI 搜索引擎（Perplexity, SearchGPT, Gemini）的引用率与权威得分。

---

## 2. 核心技术流 (The Pipeline)

### 第一阶段：多维数据脱水与输入
AI 在提炼时将同时调阅以下数据源，建立“意图-事实”闭环：
- **事实源 (Evidences)**：读取当前页面的 Lexical JSON 内容，执行“脱水”处理，提取高信号的文字、Heading 及图片 Caption。
- **意图源 (Targets)**：读取匹配该 URL 的 `SeoSettings`（包括主 SEO 的 Title/Description 以及从属 SEO 的长尾词分布）。
- **策略源 (Strategy)**：读取当前正在编辑的 Locale（语种）以及运营预设的地区打法策略。

### 第二阶段：AI 专家提炼 (Locale-Aware Skill)
利用 **Gemini 1.5 Flash** 推理引擎，执行自定义 GSEO Skill：
- **环境感知**：根据当前 Locale 代码调取对应语境。AI 优先阅读原生语种正文，而非简单的英语翻译。
- **差异化打法**：根据运营设置的 `StrategyOverride`，动态调整生成内容的侧重点（例如：针对核心市场采取“精锐模式”，针对次要市场采取“标准模式”）。
- **事实锚定**：AI 确保生成的 FAQ 中的所有事实都能在脱水正文中找到证据，链接统一指向页面主 URL，保持简单可靠。

### 第三阶段：多语言同步与分发
- **存储**：结果存入独立的 `GeoSettings` 集合，所有 GSEO 字段支持 `localized: true`。
- **分发**：集成至 **Translation Center** 接口。支持“一键同步至 24 语种”或“按重点语种人工/AI 独立调优”。

### 第四阶段：前端无侵入注入 (Zero-Touch Frontend)
- **实现方式**：在全局 `LanguageLayout` 或 `PageSeoInjector` 中引入 `GeoInjector.tsx`。
- **注入内容**：
    - `meta[name="geo.*"]` (地缘元数据)
    - `FAQPage` JSON-LD (生成式回答核心)
    - `Place` / `LocalBusiness` JSON-LD (权威地址信号)
    - `Review` JSON-LD (基于内容合成的社交认同)
- **零侵入**：现有的数十个子页模板（Applications, Products, Service 等）完全无需改动。

---

## 3. 运营管理体验 (Operation Experience)

1.  **指令配置**：在 `GseoAiConfig` 全局中心配置主 Prompt 模板及地域倾向。
2.  **内容录入**：在 `GeoSettings` 集合中设定该页面的“主打地区”和“特殊策略”。
3.  **AI 协作**：点击 `[AI 精准提炼]`，实时获得建议内容，人工审核后发布。

---

## 4. 实施工作量评估 (Person-Days)

基于本项目目前的技术状况，预计实施总工期为 **5 人日 (人日/PD)**：

| 模块 | 具体任务 | 预估工时 |
| :--- | :--- | :--- |
| **A. 基础架构 (Backend)** | 创建 `GeoSettings` 集合、`GseoAiConfig` 全局配置。 | 0.8 人日 |
| **B. AI 提炼引擎** | 编写 Lexical 脱水脚本、Gemini API 代理、Prompt 模板替换引擎。 | 1.2 人日 |
| **C. 自动化流集成** | 与现有的 Translation Center 钩子打通，支持按语种同步。 | 1.0 人日 |
| **D. 前端注入层** | 实现全局 `GeoInjector` 及 JSON-LD 注入逻辑。 | 0.8 人日 |
| **E. 提示词调优与 QA** | 24 语种边界测试、Google Schema 校验、AI 提示词微调。 | 1.2 人日 |
| **总计** | | **5.0 人日** |

---

## 5. 待办事项 (Next Steps)
- [ ] 确保 `.env` 包含 `GEMINI_API_KEY`。
- [ ] 开发 Payload CMS `GeoSettings` 核心集合。
- [ ] 配置全局 AI 策略管理中心。
- [ ] 联调前端 Injector 组件。
