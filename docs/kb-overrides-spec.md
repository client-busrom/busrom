# 知识库 (Knowledge Base) 全局继承与单页覆盖架构说明

## 1. 需求背景
目前系统的“知识库全局管理（Knowledge Base Settings）”提供了统一的详情页侧边栏和底部栏配置。甲方希望在这套全局机制的基础上，允许每篇具体的博客文章（Blogs）进行个性化的微调（覆盖全局选项、关闭某些模块、或者完全继承）。特别是底部的“翻页跳转（Pagination）”模块，需要支持除了按时间自动推算外，单篇文章还能精准指定“上一篇”和“下一篇”。

## 2. 核心架构设计：三态控制模式 (Three-state Control)
为实现此功能且不破坏老数据，设计如下三态逻辑：
在单条博客的编辑界面新增「个性化覆盖设置 (Overrides)」标签页。其中针对每个组件（如 TOC、分享、推荐等）提供一个 `mode` 选项：
- **inherit (继承全局)**：默认值。此时忽略当前页的其他配置，完全听从知识库全局管理的设置。老数据因缺少此字段，会默认 fallback 到该行为。
- **override (自定义覆盖)**：选中后，展示专属的配置项。前端优先读取此处的局部配置渲染页面。
- **disable (强制关闭)**：即使全局开启了该组件，此页面也强制隐藏。

## 3. Payload CMS 字段重构方案 (遵循 DRY 原则)
为避免在全局设置和单页设置中重复编写相同的 Fields（如 `networks`、`categories` 等），采取工厂函数提取法：
1. 创建 `src/fields/knowledgeBaseWidgets.ts` 文件。
2. 内部暴露如 `createShareConfigField()`, `createPaginationField()` 等一系列生成字段组的工厂函数。
3. 这些函数支持一个 `isOverride` 参数。如果 `isOverride` 为真，则在字段组内部自动生成 `mode` (radio) 选择框，并依据 `mode === 'override'` 来条件渲染其余配置字段；如果是 `pagination` 且开启了 `override`，则附加 `prevPost` 和 `nextPost` 的关系选择框。

## 4. 执行步骤 (Action Plan)
- **Step 1**: 新建 `src/fields/knowledgeBaseWidgets.ts`，抽离出所有的 Widget 字段结构（共 9 个模块：侧边栏 6 个 + 底部栏 3 个）。
- **Step 2**: 修改 `src/globals/KnowledgeBaseSettings.ts`，将其原有的硬编码 Fields 替换为调用上述工厂函数（传入 `isOverride: false`）。
- **Step 3**: 修改 `src/collections/Blogs.ts`，新增 `Overrides` Tab，并在其中调用上述工厂函数（传入 `isOverride: true`）。

## 5. 前端数据对接指南 (Frontend Guide)
前端在获取到 `globalConfig` 和单篇文章的 `blogOverrides` 数据后，可以使用以下逻辑进行组装：

```typescript
// 通用拦截函数
export function getWidgetConfig(globalConfig: any, localOverride: any) {
  if (!localOverride || !localOverride.mode || localOverride.mode === 'inherit') {
    return globalConfig;
  }
  if (localOverride.mode === 'disable') {
    return { ...globalConfig, enabled: false };
  }
  if (localOverride.mode === 'override') {
    return { ...globalConfig, ...localOverride };
  }
}
```

针对翻页模块的特殊逻辑处理：
```typescript
const paginationConfig = getWidgetConfig(globals.pagination, blog.paginationOverride);

if (paginationConfig?.enabled) {
  // 判断是否存在手动指定的上一篇/下一篇
  const customPrev = paginationConfig.prevPost;
  const customNext = paginationConfig.nextPost;
  
  // 对于有指定的直接使用，未指定的执行原来的按发布时间推算逻辑
  const finalPrev = customPrev || await fetchPrevPostByDate();
  const finalNext = customNext || await fetchNextPostByDate();
}
```
