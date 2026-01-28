# Custom Scripts 使用指南

## 概述

CustomScripts Collection 允许你通过CMS后台管理所有追踪代码，无需修改前端代码。

---

## 📋 支持的追踪工具模板

### 🔍 搜索引擎分析

| 工具 | 模板类型 | ID格式 | 位置 | 用途 |
|------|---------|--------|------|------|
| **Google Analytics 4** | `google_analytics_4` | `G-XXXXXXXXXX` | header | 网站流量分析 |
| **Google Tag Manager** | `google_tag_manager` | `GTM-XXXXXXX` | header | 统一管理所有追踪代码 |
| **Google Tag Manager (noscript)** | `google_tag_manager_noscript` | `GTM-XXXXXXX` | body_start | GTM备用方案 |
| **Bing UET** | `bing_uet` | `12345678` | header | Bing广告转化追踪 |
| **Yandex Metrica** | `yandex_metrica` | `12345678` | header | Yandex搜索分析（俄罗斯） |

### ✅ 搜索引擎验证标签

| 工具 | 模板类型 | ID格式 | 位置 | 用途 |
|------|---------|--------|------|------|
| **Google Search Console** | `google_search_console` | `XXXX...` (40字符) | header | 验证Google网站所有权 |
| **Bing Webmaster** | `bing_webmaster` | `XXXX...` (40字符) | header | 验证Bing网站所有权 |
| **Yandex Webmaster** | `yandex_webmaster` | `XXXX...` (16字符) | header | 验证Yandex网站所有权 |

### 📱 社交媒体追踪

| 工具 | 模板类型 | ID格式 | 位置 | 用途 |
|------|---------|--------|------|------|
| **Facebook Pixel** | `facebook_pixel` | `1234567890123456` | header | Facebook广告转化追踪 |
| **TikTok Pixel** | `tiktok_pixel` | `XXXXXXXXXXXXXXXXXX` | header | TikTok广告追踪 |

### 📊 用户行为分析

| 工具 | 模板类型 | ID格式 | 位置 | 用途 |
|------|---------|--------|------|------|
| **Microsoft Clarity** | `microsoft_clarity` | `XXXXXXXXXX` | header | 热力图和会话录像 |
| **Hotjar** | `hotjar` | `1234567` | header | 热力图和用户反馈 |

---

## 🚀 快速开始

### 方案1: 使用Google Tag Manager（推荐）

**步骤：**

1. **注册GTM账号**
   - 访问 https://tagmanager.google.com
   - 创建账号和容器
   - 获得 `GTM-XXXXXXX` ID

2. **在CMS中添加GTM**

   **记录1 - GTM Header:**
   ```
   名称: Google Tag Manager
   脚本类型: 模板
   模板类型: google_tag_manager
   Template ID: GTM-ABC1234
   脚本位置: header
   作用范围: global
   优先级: 100
   启用: ✅
   ```

   **记录2 - GTM Noscript:**
   ```
   名称: Google Tag Manager (noscript)
   脚本类型: 模板
   模板类型: google_tag_manager_noscript
   Template ID: GTM-ABC1234
   脚本位置: body_start
   作用范围: global
   优先级: 100
   启用: ✅
   ```

3. **在GTM后台配置其他追踪**
   - GA4 追踪代码
   - Facebook Pixel
   - 自定义事件（表单提交、按钮点击等）

**优势：**
- ✅ 一次部署，终身受益
- ✅ 后续添加工具无需改网站
- ✅ GTM后台可视化配置
- ✅ 支持触发规则（特定页面/事件触发）

---

### 方案2: 直接添加各个追踪工具

#### 示例1: 添加Bing UET追踪

```
名称: Bing Ads Tracking
脚本类型: 模板
模板类型: bing_uet
Template ID: 12345678
脚本位置: header
作用范围: global
优先级: 90
启用: ✅
```

#### 示例2: 添加Yandex Metrica（针对俄罗斯市场）

```
名称: Yandex Analytics
脚本类型: 模板
模板类型: yandex_metrica
Template ID: 87654321
脚本位置: header
作用范围: global
优先级: 90
启用: ✅
```

#### 示例3: 验证Google Search Console所有权

```
名称: Google Search Console Verification
脚本类型: 模板
模板类型: google_search_console
Template ID: abc123def456...（从GSC复制的验证码）
脚本位置: header
作用范围: global
优先级: 50
启用: ✅
```

---

## 📍 作用范围说明

### 1. Global（全站生效）
```
作用范围: global
```
所有页面都会加载这个脚本

**适用场景：**
- Google Analytics
- Google Tag Manager
- Facebook Pixel
- 网站验证标签

---

### 2. Page Type（特定页面类型）
```
作用范围: page_type
页面类型: product_detail
```
只在特定类型的页面加载

**适用场景：**
- 产品页专用的转化追踪
- 博客页的阅读时间统计
- 联系页的表单追踪

**可用的页面类型：**
- `home` - 首页
- `product_series_detail` - 产品系列详情
- `product_detail` - 单个产品详情
- `blog_post` - 博客文章
- `contact` - 联系页
- `about` - 关于我们
- 等等...

---

### 3. Exact Path（精确路径）
```
作用范围: exact_path
精确路径: /thank-you
```
只在特定URL路径加载

**适用场景：**
- 感谢页的转化追踪
- 特定落地页的A/B测试
- 活动页面的专属追踪

---

### 4. Path Pattern（路径模式）
```
作用范围: path_pattern
路径模式: /products/*
```
匹配特定模式的路径

**通配符说明：**
- `*` - 匹配单个路径段
- `**` - 匹配任意数量路径段

**示例：**
- `/products/*` → 匹配 `/products/abc` 但不匹配 `/products/abc/def`
- `/products/**` → 匹配所有产品相关页面
- `/blog/*/comments` → 匹配 `/blog/123/comments`

---

## 🎯 实际应用场景

### 场景1: B2B网站完整追踪（你们的场景）

**需求：**
- 追踪Google搜索来的流量
- 追踪Bing广告效果
- 针对俄罗斯市场添加Yandex
- 追踪询盘表单提交

**配置：**

1. **Google Tag Manager** (header, global, priority 100)
   - 在GTM后台添加GA4
   - 配置表单提交事件
   - 配置Google Ads转化

2. **Bing UET** (header, global, priority 90)
   - 追踪Bing广告点击

3. **Yandex Metrica** (header, path_pattern `/ru/*`, priority 90)
   - 只在俄语页面加载

4. **Google Search Console验证** (header, global, priority 50)

5. **Bing Webmaster验证** (header, global, priority 50)

6. **Yandex Webmaster验证** (header, global, priority 50)

---

### 场景2: 电商网站多渠道追踪

**需求：**
- Google/Facebook/TikTok多渠道投放
- 追踪加购、结账、购买
- 热力图分析用户行为

**配置：**

1. **GTM** (header, global)
2. **Facebook Pixel** (header, global)
3. **TikTok Pixel** (header, global)
4. **Microsoft Clarity** (header, global)
5. **Hotjar** (header, path_pattern `/products/**`)

---

## ⚙️ 高级配置

### 优先级说明

数字越大，优先级越高（先加载）

**推荐优先级：**
- 100 - GTM（最先加载）
- 90 - 其他分析工具（GA4, Bing, Yandex）
- 80 - 社交媒体Pixel（Facebook, TikTok）
- 70 - 热力图工具（Clarity, Hotjar）
- 50 - 验证标签（Search Console, Webmaster）
- 10 - 自定义脚本

---

### 脚本位置说明

| 位置 | 加载时机 | 适用场景 |
|------|---------|----------|
| **header** | `<head>` 标签内 | 大部分追踪代码、验证标签 |
| **body_start** | `<body>` 开始 | GTM noscript、某些pixel的备用方案 |
| **footer** | `</body>` 前 | 不紧急的脚本、聊天工具 |

---

## 🔒 安全机制

### 域名白名单

只有以下域名的外部脚本允许加载：

```
✅ www.googletagmanager.com
✅ www.google-analytics.com
✅ bat.bing.com
✅ mc.yandex.ru
✅ connect.facebook.net
✅ analytics.tiktok.com
✅ clarity.ms
✅ static.hotjar.com
... 等等
```

**任何不在白名单的域名都会被阻止！**

---

### 模板 vs 自定义脚本

**模板脚本（推荐）：**
- ✅ 预先验证安全
- ✅ 自动通过安全检查
- ✅ 普通用户可创建

**自定义脚本：**
- ⚠️ 需要管理员权限
- ⚠️ 会进行安全验证
- ⚠️ 可能被安全机制阻止

---

## 📝 如何获取追踪ID

### Google Analytics 4
1. 访问 https://analytics.google.com
2. 创建属性
3. 数据流 → 选择Web → 复制"衡量ID"（G-XXXXXXXXXX）

### Google Tag Manager
1. 访问 https://tagmanager.google.com
2. 创建容器
3. 复制容器ID（GTM-XXXXXXX）

### Bing UET
1. 访问 https://ads.microsoft.com
2. 工具 → UET标记
3. 创建UET标记 → 复制标记ID

### Yandex Metrica
1. 访问 https://metrika.yandex.ru
2. 添加计数器
3. 复制计数器号码

### Facebook Pixel
1. 访问 https://business.facebook.com/events_manager
2. 数据源 → 像素
3. 复制像素ID（16位数字）

### Google Search Console
1. 访问 https://search.google.com/search-console
2. 添加资源
3. 选择"HTML标签"验证方式
4. 复制 `content="..."` 中的验证码

---

## ❓ 常见问题

### Q: 我已经有GTM，还需要单独添加GA4吗？
**A:** 不需要！在GTM后台添加GA4标签即可，CustomScripts中只需要添加GTM。

### Q: 验证标签是否会影响性能？
**A:** 不会。验证标签只是一个简单的meta标签，不会加载外部脚本。

### Q: 如何测试追踪代码是否生效？
**A:**
1. 访问网站
2. 右键 → 查看页面源代码
3. 搜索你的追踪ID
4. 或使用浏览器扩展（如 Tag Assistant for Google Tag Manager）

### Q: 可以针对不同语言版本加载不同追踪代码吗？
**A:** 可以！使用 path_pattern：
- `/en/*` - 英语页面
- `/zh/*` - 中文页面
- `/ru/*` - 俄语页面

### Q: 脚本没有生效怎么办？
**A:** 检查：
1. 是否启用了脚本（isEnabled）
2. 作用范围是否匹配当前页面
3. 浏览器控制台是否有错误
4. 域名是否在白名单中

---

## 🎓 最佳实践

### 1. 推荐使用GTM管理一切
除非只需要简单的GA4追踪，否则强烈推荐使用GTM。

### 2. 验证标签单独创建
不要和追踪代码混在一起，便于管理和调试。

### 3. 使用清晰的命名
- ✅ "Google Tag Manager - Production"
- ✅ "Bing Webmaster Verification"
- ❌ "script1"
- ❌ "test"

### 4. 设置合理的优先级
GTM最高，验证标签最低。

### 5. 测试后再启用
先在测试环境验证，确认无误后再启用。

---

## 📚 相关资源

- [Google Tag Manager 文档](https://support.google.com/tagmanager)
- [Google Analytics 4 文档](https://support.google.com/analytics)
- [Bing UET 文档](https://help.ads.microsoft.com)
- [Yandex Metrica 文档](https://yandex.com/support/metrica/)
- [Facebook Pixel 文档](https://www.facebook.com/business/help/742478679120153)

---

**更新日期**: 2026-01-24
**版本**: 2.0 - 新增Bing UET、Yandex Metrica、搜索引擎验证标签
