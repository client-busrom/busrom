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
