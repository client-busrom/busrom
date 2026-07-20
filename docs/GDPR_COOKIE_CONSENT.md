# GDPR Cookie 同意方案（Klaro + Consent Mode v2）

> 状态：**第一阶段已完成（核心架子 + 关键门控）**，第二阶段待做（运营脚本门控 + Geo-IP + 隐私政策页）
> 创建日期：2026-07-16

## 一、为什么需要

网站面向欧洲（EEA/UK/瑞士）用户，存在 GDPR 合规缺口：

- 原 CDP SDK、Tawk.to 客服、GTM 在**未取得用户同意前**就加载并追踪 → 违反 GDPR 第 6 条
- 无 Cookie 同意 Banner，无撤回入口 → 违反第 7(3) 条
- 未对接 Google Consent Mode v2 → EEA 区域 GA4/Ads 数据为 0

## 二、技术选型

采用 **Klaro**（MIT 开源，零订阅，原生 i18n），不依赖 SaaS。

## 三、已完成的改动

### 3.1 新增文件

| 文件 | 作用 |
|---|---|
| `web/lib/consent/klaro-config.ts` | Klaro 配置工厂（4 类服务 / 4 个目的 / en+zh 文案） |
| `web/lib/consent/use-consent.ts` | `useConsent()` / `useConsentConfirmed()` / `reopenConsent()` |
| `web/components/consent/CookieConsentProvider.tsx` | 客户端 Provider，加载 Klaro + 广播同意变化 + 同步 Consent Mode v2 |
| `web/components/consent/ConsentModeDefaultScript.tsx` | head 内 inline script，GTM 加载前注入"默认全部拒绝" |
| `web/components/consent/CookieSettingsLink.tsx` | footer 用的"Cookie 设置"按钮（重新打开偏好面板） |
| `web/types/klaro.d.ts` | Klaro 的 TypeScript 类型声明 |

### 3.2 改动文件

| 文件 | 改动 |
|---|---|
| `web/app/[locale]/layout.tsx` | head 顶部插入 `<ConsentModeDefaultScript />`；body 用 `<CookieConsentProvider>` 包裹 CDP/GlobalScripts/Tawk |
| `web/app/components/CDPProvider.tsx` | 加 `useConsent('analytics')`，未同意不初始化 CDP |
| `web/components/layout/tawk-chat.tsx` | 加 `useConsent('functional')`，未同意不加载客服脚本 |
| `web/package.json` | 新增 `klaro` 依赖 |

### 3.3 同意分类

| 目的 (purpose) | 服务 | 默认 | 对应 Consent Mode 信号 |
|---|---|---|---|
| `necessary` 必要 | (无，banner 自身) | 强制开 | `security_storage=granted` |
| `functional` 功能 | Tawk.to 客服 | 默认关 | `functionality_storage` |
| `analytics` 统计 | CDP SDK | 默认关 | `analytics_storage` |
| `marketing` 营销 | GTM、CMS 自定义脚本、**Microsoft UET (Bing Ads)** | 默认关 | `ad_storage` / `ad_user_data` / `ad_personalization` |

## 四、环境变量

```bash
# .env（可选，默认 .busromhouse.com）
NEXT_PUBLIC_CONSENT_COOKIE_DOMAIN=.busromhouse.com
```

## 五、后续待做（第二阶段）

> 以下不在本次提交内，需单独排期。

### 5.1 运营脚本门控（需要改 Payload collection）
- 给 `CustomScript` collection 增加 `consentCategory` 字段（select: necessary/functional/analytics/marketing）
- 把 `GlobalScripts` / `PageScripts` 的 `ScriptRenderer` 改成客户端组件，根据 `useConsent()` 决定是否渲染
- 触发 Payload migration

### 5.2 Geo-IP 地域判断（仅 EEA 显示 Banner）
- 在 layout.tsx 服务端读 `x-vercel-ip-country` 或自建 Geo-IP，判断是否 EEA/UK/瑞士
- 非 EEA 用户：自动注入"全部同意"并跳过 Banner（保留撤回入口）

### 5.3 隐私政策页更新
- `/privacy-policy` 补充 Cookie 清单章节（4 类、每个服务、保留期、第三方链接）
- 法务确认文案

### 5.4 多语言文案补全
- 当前 en/zh 完整，其余 22 种 locale 自动 fallback 到 en
- 运营提供 de/fr/es/it/nl 等 EEA 主流语言文案后，补到 `klaro-config.ts` 的 translations

### 5.5 Klaro UI 品牌化
- 覆盖 Klaro 默认 CSS（金色 #D58A00 主题），放 `web/app/globals.css` 或独立样式

## 六、测试清单

- [ ] 首次访问：Banner 出现，默认全部未勾选
- [ ] 点"全部拒绝"：CDP 不发请求、Tawk 不加载、GTM consent=denied
- [ ] 点"全部接受"：CDP pageview 发出、Tawk 加载、GTM consent=granted
- [ ] 点"保存选择"只勾 analytics：CDP 工作、Tawk 不加载
- [ ] 刷新页面：选择被记住（cookie `busrom_consent` 持久化）
- [ ] footer "Cookie settings" 点击：重新打开偏好面板
- [ ] GTM Tag Assistant 验证：Consent Mode v2 信号随选择更新

## 七、注意事项

- `components/CdpProvider.tsx`（大写 Cdp）是**废弃旧文件**（用 `getTracker` 旧 API），真正的 Provider 是 `app/components/CDPProvider.tsx`。type-check 会报旧文件错误，与本次无关，建议后续清理。
- Klaro 的 `storageMethod=cookie`，服务端可通过 `next/headers` 读 `busrom_consent` 做 SSR 门控（Geo-IP 阶段会用到）。

## 八、Microsoft UET (Bing Ads) Consent 接入说明

### 8.1 背景
甲方要求按 Microsoft 官方文档接入 UET Consent Mode，保证 EEA 用户数据合规回传。

### 8.2 已实现（三步联动）

| 步骤 | 位置 | 时机 |
|---|---|---|
| ① `default denied` | `payload-cms/src/collections/CustomScripts.ts` 的 `bing_uet` 模板 | UET 加载时（页面渲染） |
| ② `update granted` | `web/components/consent/CookieConsentProvider.tsx` 的 `syncConsentMode()` | 用户在 Klaro banner 同意 marketing |
| ③ `update denied` | 同上 | 用户拒绝 marketing |

### 8.3 工作流程

```
用户访问页面
  ↓
[UET 加载] → uetq.push('consent', 'default', {ad_storage: 'denied'})  ← 模板自带
  ↓
[Klaro banner 弹出]
  ↓
用户点"接受 marketing"
  ↓
[syncConsentMode] → uetq.push('consent', 'update', {ad_storage: 'granted'})  ← 自动
                 → gtag('consent', 'update', {...})                          ← Google 同步
  ↓
UET 开始正常追踪 / GA4 Ads 开始追踪
```

### 8.4 运营操作
运营只需在 Payload CMS → CustomScripts → 新建 → 选"Bing UET"模板 → 填 Tag ID → 启用。
**无需手动粘贴 consent 代码**（已在模板里）。

### 8.5 注意
- UET 通过 CMS 模板注入，属 `cms-scripts` 服务（归 marketing 类别）
- 用户未同意 marketing 时，UET 仍会加载但发匿名 ping（Microsoft 官方设计）
- 第二阶段改造 GlobalScripts 客户端门控后，未同意时 UET 完全不加载（更严格）

## 九、问题排查与修复记录（2026-07-20）

### 9.1 问题描述
测试时发现：
1. **GA4 返回 `gcs=G100`**（所有 consent 信号为 denied）
2. **Microsoft Clarity** 显示 "Data from this session is not being collected... due to your configured project settings"
3. **Bing UET** 仅触发 Page Load Event，无自定义事件（如 Email Click）
4. **转化目标未触发**

### 9.2 根因分析
所有问题的根源是同一个：**GDPR Cookie 同意机制默认将所有非必要 cookie 设为 denied，且允许用户在未明确同意的情况下继续浏览** (`mustConsent: false`)。

| 平台 | 拦截机制 | 返回值 |
|------|---------|--------|
| GA4 | Google Consent Mode default = denied，未收到 update | `gcs=G100` |
| Clarity | 项目设置启用了 consent 保护，收到 denied 信号后停止采集 | "not being collected" |
| Bing UET | UET consent mode default = denied + 代码侧 consent 门控 | 仅 PageLoad |

### 9.3 已实施的修复

#### 修复 1：增大 `wait_for_update` 超时时间
**文件**：`web/components/consent/ConsentModeDefaultScript.tsx`
- 将 `wait_for_update` 从 500ms 增加到 1500ms
- 原因：Klaro 动态 import + 初始化可能需要更长时间，500ms 窗口可能不够

#### 修复 2：添加 Microsoft Clarity Consent API 集成
**文件**：`web/components/consent/CookieConsentProvider.tsx`
- 在 `syncConsentMode()` 中添加 `clarity('consent')` 调用
- 当用户同意 marketing consent 时，调用 Clarity 自有的 consent API
- 这解决了 Clarity 项目设置中 consent mode 导致的数据采集停止问题

#### 修复 3：为 GlobalScripts 添加 consent 门控（Phase 2 部分实现）
**新增文件**：
- `web/components/consent/ConsentAwareScript.tsx` — 客户端包装组件，只在 consent 授权后渲染 Script
- `web/components/consent/ConsentGatedScripts.tsx` — 通用 consent 门控包装组件

**修改文件**：`web/components/GlobalScripts.tsx`
- 新增 `isAnalyticsScript()` 函数，根据模板类型判断脚本类别
- Analytics 脚本（GA4/GTM）：立即加载，接收 consent 信号
- Marketing 脚本（Clarity/UET/Meta 等）：使用 `ConsentAwareScript` 包装，只在用户同意 marketing 后加载

#### 修复 4：修复 Klaro Manager 初始化问题（关键 Bug）
**问题**：Klaro 的 `setup()` 函数会将 `window.klaro` 覆盖为 Preact 组件，导致 `getManager()` 不可用。`isConsentGiven()` 始终返回 `false`，consent 状态无法同步到 GA4/UET/Clarity。

**修复**：
- `CookieConsentProvider.tsx`：setup() 后遍历 Preact 组件树提取 manager 引用，存入 `window.__klaroManager`
- `use-consent.ts`：`isConsentGiven()` 改用 `manager.consents` 对象直接查询，不再依赖 `getConsent()`
- 新增 `PURPOSE_TO_SERVICES` 映射（Klaro 的 `getConsent()` 只接受 service 名，不接受 purpose 名）

**验证结果**（本地测试）：
- ✅ Consent 状态正确：`{cdp: true, gtm: true, tawk: true, cms-scripts: true}`
- ✅ Google Consent Mode 更新为 `granted`
- ⚠️ UET/Clarity 本地未加载（正常，需要 CMS 配置的第三方脚本）

### 9.4 测试要求
**关键前提**：测试者必须点击 Cookie Banner 上的"全部接受"按钮，否则所有追踪都会被阻止。

测试步骤：
1. 清除浏览器 cookie 和 localStorage
2. 访问网站，等待 Cookie Banner 出现
3. 点击"全部接受"
4. 验证 GA4 返回 `gcs=G110`（analytics=granted, ad=granted）
5. 验证 Clarity 开始采集数据
6. 点击 Email 按钮，验证 UET 触发 "Email Click" 事件
7. 验证 Bing 转化目标触发

### 9.5 验证命令
在浏览器控制台执行：
```javascript
// 检查 consent 状态
window.klaro?.getManager()?.getConsent('marketing')  // 应返回 true
window.klaro?.getManager()?.getConsent('analytics')  // 应返回 true

// 检查 GA4 consent mode
window.dataLayer?.filter(d => d[0] === 'consent')  // 应看到 update granted

// 检查 UET consent
window.uetq?.filter(d => d[0] === 'consent')  // 应看到 update granted

// 检查 Clarity
window.clarity  // 应存在
```
