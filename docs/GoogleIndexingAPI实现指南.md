# Google Indexing API 实现指南

## 📋 什么是 Google Indexing API?

Google Indexing API 允许网站主动通知 Google 有关页面更新,加快索引速度。

### ⚠️ 重要限制

**Google Indexing API 主要用于:**
- ✅ **招聘信息** (JobPosting)
- ✅ **直播视频** (BroadcastEvent)
- ⚠️ **一般网页** - Google 不推荐使用,建议使用 Sitemap

**配额限制:**
- 每天最多 200 次请求
- 不适合大量 URL 提交

---

## 🆚 Google Indexing API vs IndexNow

| 特性 | Google Indexing API | IndexNow |
|------|---------------------|----------|
| 支持搜索引擎 | 仅 Google | Bing, Yandex, Seznam |
| 适用场景 | 招聘、视频 | 所有内容 |
| 配额 | 200/天 | 无限制 |
| 配置难度 | 复杂 (需 Service Account) | 简单 (仅需 API Key) |
| 是否推荐 | ⚠️ 非必需 | ✅ 推荐 |

**建议**:
- 如果你的网站有招聘信息或直播视频 → 实现 Google Indexing API
- 普通内容网站 → 使用 Sitemap + IndexNow 即可

---

## 🔧 实现步骤 (如果需要)

### 步骤 1: 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目: `busrom-indexing`
3. 启用 **Indexing API**:
   - 进入 "APIs & Services" → "Enable APIs and Services"
   - 搜索 "Indexing API"
   - 点击 "Enable"

### 步骤 2: 创建 Service Account

1. 进入 "IAM & Admin" → "Service Accounts"
2. 点击 "Create Service Account"
3. 填写信息:
   - Name: `busrom-indexing-bot`
   - Description: `Service account for Google Indexing API`
4. 点击 "Create and Continue"
5. 跳过权限设置,点击 "Done"

### 步骤 3: 生成密钥

1. 点击创建的 Service Account
2. 进入 "Keys" 标签
3. 点击 "Add Key" → "Create new key"
4. 选择 JSON 格式
5. 下载 JSON 密钥文件 (类似 `busrom-indexing-xxxxxx.json`)

**⚠️ 重要**: 保管好此文件,不要提交到 Git!

### 步骤 4: 在 Google Search Console 中授权

1. 登录 [Google Search Console](https://search.google.com/search-console)
2. 选择你的网站
3. 进入 "Settings" → "Users and permissions"
4. 点击 "Add user"
5. 输入 Service Account 邮箱 (格式: `busrom-indexing-bot@busrom-indexing.iam.gserviceaccount.com`)
6. 权限选择: **Owner**
7. 点击 "Add"

### 步骤 5: 配置环境变量

将 Service Account 密钥添加到环境变量:

```bash
# .env.local (CMS)
GOOGLE_SERVICE_ACCOUNT_EMAIL=busrom-indexing-bot@busrom-indexing.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"busrom-indexing",...}'
```

**或者使用文件路径**:

```bash
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=/path/to/busrom-indexing-xxxxxx.json
```

### 步骤 6: 在 SiteConfig 添加配置字段

修改 `cms/schemas/SiteConfig.ts`:

```typescript
// 添加到 SEO & Internationalization 部分

/**
 * Enable Google Indexing API (启用 Google Indexing API)
 */
enableGoogleIndexing: checkbox({
  defaultValue: false,
  label: 'Enable Google Indexing API (启用 Google Indexing API)',
  ui: {
    description: `Enable Google Indexing API for instant indexing.
Note: Only recommended for JobPosting and BroadcastEvent content.
启用 Google Indexing API 以实现即时索引。
注意：仅推荐用于招聘信息和直播视频内容。`,
  },
}),

/**
 * Google Service Account Email
 */
googleServiceAccountEmail: text({
  label: 'Google Service Account Email',
  ui: {
    description: 'Service account email from Google Cloud Console | Google Cloud 控制台的服务账号邮箱',
  },
}),
```

### 步骤 7: 安装依赖

```bash
cd cms
npm install googleapis
```

### 步骤 8: 创建提交函数

创建文件: `cms/lib/google-indexing.ts`

```typescript
/**
 * Google Indexing API Implementation
 *
 * This module provides functionality to submit URL updates to Google
 * using the Indexing API.
 *
 * Documentation: https://developers.google.com/search/apis/indexing-api/v3/quickstart
 *
 * IMPORTANT: Google recommends using this API only for:
 * - Job postings (JobPosting schema)
 * - Livestream videos (BroadcastEvent schema)
 *
 * For general content, use Sitemap instead.
 */

import { google } from 'googleapis'

/**
 * Site Config Interface
 */
interface SiteConfig {
  enableGoogleIndexing?: boolean | null
  googleServiceAccountEmail?: string | null
}

/**
 * Fetch Site Config
 */
async function getSiteConfig(context: any): Promise<SiteConfig | null> {
  try {
    const siteConfig = await context.db.SiteConfig.findMany({
      take: 1,
    })
    return siteConfig[0] || null
  } catch (error) {
    console.error('Error fetching site config:', error)
    return null
  }
}

/**
 * Create Google Auth Client
 */
function createAuthClient() {
  // Try to load from file first
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
    return new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    })
  }

  // Otherwise, load from environment variable
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    })
  }

  throw new Error('Google Service Account credentials not configured')
}

/**
 * Submit URL to Google Indexing API
 *
 * @param url - Full URL to submit
 * @param type - Update type: 'URL_UPDATED' or 'URL_DELETED'
 * @param context - Keystone context
 */
export async function submitToGoogleIndexing(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED',
  context: any
): Promise<boolean> {
  try {
    console.log(`📡 Google Indexing API: Submitting ${type} for ${url}`)

    // Fetch site config
    const config = await getSiteConfig(context)

    if (!config?.enableGoogleIndexing) {
      console.log('⏭️  Google Indexing API is disabled. Skipping submission.')
      return false
    }

    // Create auth client
    const auth = createAuthClient()

    // Create Indexing API client
    const indexing = google.indexing({ version: 'v3', auth })

    // Submit URL
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type,
      },
    })

    if (response.status === 200) {
      console.log(`✅ Google Indexing API: Successfully submitted ${url}`)
      return true
    } else {
      console.error(`❌ Google Indexing API: Failed (${response.status}: ${response.statusText})`)
      return false
    }
  } catch (error: any) {
    console.error('❌ Google Indexing API: Error submitting URL:', error.message || error)

    // Log specific error details
    if (error.response) {
      console.error(`   Status: ${error.response.status}`)
      console.error(`   Data: ${JSON.stringify(error.response.data)}`)
    }

    return false
  }
}

/**
 * Submit URL Update
 */
export async function submitUrlUpdate(url: string, context: any): Promise<boolean> {
  return submitToGoogleIndexing(url, 'URL_UPDATED', context)
}

/**
 * Submit URL Deletion
 */
export async function submitUrlDeletion(url: string, context: any): Promise<boolean> {
  return submitToGoogleIndexing(url, 'URL_DELETED', context)
}

/**
 * Get URL Status from Google
 *
 * Check the indexing status of a URL
 */
export async function getUrlStatus(url: string): Promise<any> {
  try {
    const auth = createAuthClient()
    const indexing = google.indexing({ version: 'v3', auth })

    const response = await indexing.urlNotifications.getMetadata({
      url: url,
    })

    return response.data
  } catch (error: any) {
    console.error('Error getting URL status:', error.message || error)
    return null
  }
}

/**
 * Helper: Build full URL from path
 */
export function buildFullUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'
  return `${baseUrl}${path}`
}
```

### 步骤 9: 在 CMS Hooks 中集成

**仅用于招聘信息或视频内容**:

```typescript
// cms/schemas/JobPosting.ts (如果有招聘模块)
import { submitUrlUpdate, submitUrlDeletion, buildFullUrl } from '../lib/google-indexing'

export const JobPosting = list({
  // ... 其他配置

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      try {
        const jobUrl = buildFullUrl(`/careers/${item.slug}`)

        if (operation === 'create' || operation === 'update') {
          if (item?.status === 'PUBLISHED') {
            await submitUrlUpdate(jobUrl, context)
          }
        }

        if (operation === 'delete') {
          await submitUrlDeletion(jobUrl, context)
        }
      } catch (error) {
        console.error('Error submitting to Google Indexing API:', error)
      }
    },
  },
})
```

---

## 🧪 测试步骤

### 1. 配置环境变量

确保 `.env.local` 包含:

```bash
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### 2. 配置 CMS

1. 登录 CMS
2. 进入 Site Config
3. 勾选 `Enable Google Indexing API`
4. 填写 `Google Service Account Email`
5. 保存

### 3. 测试提交

创建或更新一个招聘信息,查看日志:

```
📡 Google Indexing API: Submitting URL_UPDATED for https://busrom.com/careers/senior-engineer
✅ Google Indexing API: Successfully submitted https://busrom.com/careers/senior-engineer
```

### 4. 验证提交

在 Google Search Console 中:
1. 进入 "URL Inspection"
2. 输入提交的 URL
3. 查看索引状态

---

## ⚠️ 重要注意事项

### 1. 配额限制

- **每天最多 200 次请求**
- 超出配额会返回 429 错误
- 不要用于所有内容更新

### 2. 适用场景

**✅ 推荐使用:**
- 招聘信息 (JobPosting)
- 直播视频 (BroadcastEvent)
- 时效性强的内容

**❌ 不推荐使用:**
- 博客文章
- 产品页面
- 静态内容

对于一般内容,**使用 Sitemap + IndexNow 更合适**!

### 3. 安全性

- ❌ 不要将 Service Account 密钥提交到 Git
- ✅ 使用环境变量存储
- ✅ 定期轮换密钥

---

## 📊 推荐方案总结

对于 Busrom 项目,建议使用以下组合:

### ✅ 必须实现

1. **Sitemap** - 已实现 ✅
2. **IndexNow** - 推荐实现 🟡
   - 用于产品、博客、案例等内容
   - 支持 Bing、Yandex

### ⚠️ 可选实现

3. **Google Indexing API** - 非必需
   - 仅在有招聘信息或视频时实现
   - 一般网页不需要

### 为什么?

- **Sitemap** - 所有搜索引擎都支持,是基础
- **IndexNow** - 免费、无配额、配置简单
- **Google Indexing API** - 配置复杂、有配额、仅特定内容

---

## 📚 参考资料

- **官方文档**: https://developers.google.com/search/apis/indexing-api/v3/quickstart
- **配额说明**: https://developers.google.com/search/apis/indexing-api/v3/quota-pricing
- **Google Search Console**: https://search.google.com/search-console

---

## 💡 结论

**对于 Busrom 项目,建议:**

1. ✅ 保留 Sitemap (已实现)
2. ✅ 实现 IndexNow (简单且有效)
3. ❌ 暂不实现 Google Indexing API (除非有招聘模块)

**原因**:
- Google Indexing API 主要用于招聘和视频
- Busrom 是五金产品网站,不需要这个 API
- Sitemap + IndexNow 已经足够

---

**上一步**: [IndexNow 实现指南](./IndexNow实现指南.md)
**下一步**: 实现 IndexNow 协议
