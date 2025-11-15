# Sitemap 和 Robots.txt 功能测试指南

## 📋 测试概述

本文档提供 Sitemap 和 Robots.txt 功能的完整测试步骤和预期结果。

---

## 🚀 快速测试

### 方法 1: 浏览器测试 (推荐)

1. **打开浏览器访问 Sitemap:**
   ```
   http://localhost:3001/sitemap.xml
   ```

   **预期结果:**
   - 浏览器显示格式化的 XML 文档
   - 包含 `<?xml version="1.0" encoding="UTF-8"?>` 声明
   - 包含多个 `<url>` 条目

2. **打开浏览器访问 Robots.txt:**
   ```
   http://localhost:3001/robots.txt
   ```

   **预期结果:**
   - 浏览器显示纯文本内容
   - 包含 `User-agent: *` 指令
   - 包含 `Sitemap: http://localhost:3001/sitemap.xml` 链接

---

### 方法 2: 命令行测试

#### 测试 Sitemap

```bash
# 获取 Sitemap 内容
curl http://localhost:3001/sitemap.xml

# 查看前 20 行
curl -s http://localhost:3001/sitemap.xml | head -20

# 统计包含的 URL 数量
curl -s http://localhost:3001/sitemap.xml | grep -c '<loc>'

# 检查 HTTP 状态码
curl -I http://localhost:3001/sitemap.xml | grep "HTTP"
```

#### 测试 Robots.txt

```bash
# 获取 Robots.txt 内容
curl http://localhost:3001/robots.txt

# 检查是否包含 Sitemap 链接
curl -s http://localhost:3001/robots.txt | grep "Sitemap"

# 检查 HTTP 状态码
curl -I http://localhost:3001/robots.txt | grep "HTTP"
```

---

## 📊 详细测试步骤

### 测试 1: Sitemap 基本功能

**步骤:**
1. 在浏览器中访问 `http://localhost:3001/sitemap.xml`
2. 检查页面是否正常加载
3. 检查 HTTP 状态码是否为 200

**预期结果:**
- ✅ 页面正常加载,无错误
- ✅ HTTP 状态码: 200 OK
- ✅ Content-Type: application/xml

**实际 Sitemap 示例:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:3001/</loc>
    <lastmod>2025-11-05T04:34:30.967Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>http://localhost:3001/product</loc>
    <lastmod>2025-11-05T04:34:30.967Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  ...
</urlset>
```

---

### 测试 2: Sitemap 包含的页面

**检查是否包含以下页面类型:**

#### 静态页面 (必须包含)
- ✅ `/` - 首页 (priority: 1.0)
- ✅ `/product` - 产品系列列表页 (priority: 0.9)
- ✅ `/shop` - 商店列表页 (priority: 0.9)
- ✅ `/service` - 服务页面 (priority: 0.8)
- ✅ `/service/one-stop-shop` - 一站式服务 (priority: 0.7)
- ✅ `/service/faq` - FAQ 页面 (priority: 0.7)
- ✅ `/service/application` - 应用案例列表 (priority: 0.8)
- ✅ `/about-us/story` - 关于我们 (priority: 0.6)
- ✅ `/about-us/blog` - 博客列表 (priority: 0.7)
- ✅ `/about-us/support` - 支持页面 (priority: 0.6)
- ✅ `/privacy-policy` - 隐私政策 (priority: 0.3)
- ✅ `/fraud-notice` - 欺诈提醒 (priority: 0.3)
- ✅ `/contact-us` - 联系我们 (priority: 0.7)

#### 动态页面 (如果数据库有数据)
- `/product/[slug]` - 产品系列详情页 (priority: 0.9, changefreq: weekly)
  - 示例: `/product/glass-standoff-pins`
- `/shop/[sku]` - 产品详情页 (priority: 0.8, changefreq: weekly)
  - 示例: `/shop/GDH-001-SS`
- `/about-us/blog/[slug]` - 博客文章页 (priority: 0.6, changefreq: monthly)
  - 示例: `/about-us/blog/how-to-install-glass-hardware`
- `/service/application/[id]` - 应用案例详情页 (priority: 0.7, changefreq: monthly)

**测试方法:**
```bash
# 保存 sitemap 到文件
curl -s http://localhost:3001/sitemap.xml > sitemap.xml

# 检查特定页面是否存在
grep "<loc>http://localhost:3001/</loc>" sitemap.xml
grep "<loc>http://localhost:3001/product</loc>" sitemap.xml

# 统计动态页面数量
grep -c '/shop/' sitemap.xml  # 产品详情页数量
grep -c '/product/.*/</loc>' sitemap.xml  # 产品系列页数量
grep -c '/about-us/blog/.*/</loc>' sitemap.xml  # 博客文章数量
```

---

### 测试 3: Sitemap 元数据

**检查每个 URL 是否包含完整的元数据:**

- ✅ `<loc>` - URL 地址
- ✅ `<lastmod>` - 最后修改时间 (ISO 8601 格式)
- ✅ `<changefreq>` - 更新频率 (daily, weekly, monthly, yearly)
- ✅ `<priority>` - 优先级 (0.0 - 1.0)

**验证示例:**
```xml
<url>
  <loc>http://localhost:3001/product</loc>
  <lastmod>2025-11-05T04:34:30.967Z</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

---

### 测试 4: Robots.txt 基本功能

**步骤:**
1. 在浏览器中访问 `http://localhost:3001/robots.txt`
2. 检查页面是否正常加载
3. 检查内容是否合理

**预期结果:**
```
# Busrom Robots.txt
# Updated: 2025-11-05T...

User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Disallow private routes
Disallow: /_next/
Disallow: /static/

# Crawl-delay for all bots
Crawl-delay: 1

# Sitemap
Sitemap: http://localhost:3001/sitemap.xml
```

**检查要点:**
- ✅ 包含 `User-agent: *` 指令
- ✅ 正确屏蔽 `/admin/` 和 `/api/` 路径
- ✅ 包含 `Sitemap:` 指令并指向正确的 URL
- ✅ Content-Type: text/plain

---

### 测试 5: 缓存策略

**测试 Sitemap 缓存:**
```bash
curl -I http://localhost:3001/sitemap.xml | grep -i "cache-control"
```

**预期结果:**
```
cache-control: public, max-age=3600, s-maxage=3600
```

**测试 Robots.txt 缓存:**
```bash
curl -I http://localhost:3001/robots.txt | grep -i "cache-control"
```

**预期结果:**
```
cache-control: public, max-age=3600, s-maxage=3600
```

**说明:**
- `max-age=3600` - 浏览器缓存 1 小时
- `s-maxage=3600` - CDN 缓存 1 小时
- 这样可以减少服务器负载,同时保证内容不会太旧

---

### 测试 6: CMS 配置 Robots.txt

**步骤:**
1. 登录 CMS 后台: `http://localhost:3000`
2. 进入 **Site Config** (站点配置)
3. 找到 **Robots.txt Content** 字段
4. 修改内容,例如添加:
   ```
   User-agent: Googlebot
   Allow: /

   User-agent: *
   Disallow: /private/

   Sitemap: http://localhost:3001/sitemap.xml
   ```
5. 保存配置
6. 等待 1 小时缓存过期,或重启服务
7. 再次访问 `http://localhost:3001/robots.txt`

**预期结果:**
- ✅ Robots.txt 显示你在 CMS 中配置的内容
- ✅ 如果 CMS 配置为空,显示默认内容
- ✅ Sitemap 链接始终存在(自动添加)

---

### 测试 7: 错误处理

#### 7.1 CMS 服务停止时

**步骤:**
1. 停止 CMS 服务 (端口 3000)
2. 访问 `http://localhost:3001/sitemap.xml`
3. 访问 `http://localhost:3001/robots.txt`

**预期结果:**
- Sitemap: 至少返回静态页面列表(不会完全失败)
- Robots.txt: 返回默认配置(不会完全失败)

#### 7.2 数据库无数据时

**预期结果:**
- Sitemap 只包含静态页面
- 不会显示错误信息
- HTTP 状态码仍然是 200

---

## 🔍 SEO 验证工具

### Google Search Console

1. 提交 Sitemap:
   - 登录 Google Search Console
   - 进入 "Sitemaps" 部分
   - 添加新的 sitemap: `https://busrom.com/sitemap.xml`

2. 验证 Robots.txt:
   - 使用 "robots.txt Tester" 工具
   - 测试各种 URL 是否被正确允许/屏蔽

### 在线验证工具

- **Sitemap 验证器**: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Robots.txt 测试器**: https://support.google.com/webmasters/answer/6062598

---

## 📈 性能测试

### 测试加载时间

```bash
# 测试 Sitemap 响应时间
time curl -s http://localhost:3001/sitemap.xml > /dev/null

# 测试 Robots.txt 响应时间
time curl -s http://localhost:3001/robots.txt > /dev/null
```

**预期结果:**
- Sitemap: < 2秒 (取决于数据库中的数据量)
- Robots.txt: < 500ms

---

## ✅ 测试检查清单

完成以下所有测试项:

### Sitemap
- [ ] `/sitemap.xml` 可访问 (HTTP 200)
- [ ] XML 格式正确
- [ ] 包含所有静态页面
- [ ] 包含动态页面(产品、博客、案例)
- [ ] 每个 URL 包含 lastmod, changefreq, priority
- [ ] Content-Type 为 application/xml
- [ ] 缓存头设置正确 (1 小时)
- [ ] 当 CMS 停止时仍可访问(返回静态页面)

### Robots.txt
- [ ] `/robots.txt` 可访问 (HTTP 200)
- [ ] 包含 User-agent 指令
- [ ] 包含 Sitemap 链接
- [ ] 正确屏蔽 /admin/ 和 /api/ 路径
- [ ] Content-Type 为 text/plain
- [ ] 缓存头设置正确 (1 小时)
- [ ] 可通过 CMS 配置自定义内容
- [ ] 当 CMS 停止时仍可访问(返回默认配置)

---

## 🐛 常见问题

### Q1: Sitemap 生成很慢

**原因**: 需要查询数据库获取所有产品、博客、案例等数据

**解决方案**:
- 已经实现了 1 小时缓存
- 可以考虑使用后台任务定期生成静态 sitemap 文件
- 优化数据库查询(添加索引)

### Q2: Robots.txt 修改后不生效

**原因**: 缓存未过期

**解决方案**:
- 等待 1 小时缓存自动过期
- 或重启 Web 服务
- 或清除 CDN 缓存(如果使用 CDN)

### Q3: Sitemap 缺少某些页面

**检查:**
1. 数据库中该内容的 `status` 是否为 `PUBLISHED`
2. 该内容是否已经创建并保存
3. 查看服务器日志是否有错误

### Q4: 生产环境的 URL 不对

**问题**: Sitemap 中的 URL 是 `http://localhost:3001/...`

**解决方案**: 设置环境变量
```bash
# .env.production
NEXT_PUBLIC_SITE_URL=https://busrom.com
```

---

## 🎯 测试总结

### 功能完整性: ✅

- ✅ Sitemap XML 自动生成
- ✅ 包含静态和动态页面
- ✅ 正确的元数据 (lastmod, changefreq, priority)
- ✅ Robots.txt 自动生成
- ✅ 可通过 CMS 配置 Robots.txt
- ✅ 自动包含 Sitemap 链接
- ✅ 缓存策略 (1 小时)
- ✅ 错误处理 (CMS 停止时仍可用)

### SEO 优化: ✅

- ✅ 符合 Sitemaps.org 标准
- ✅ 正确的 XML 命名空间
- ✅ 优先级设置合理
- ✅ 更新频率设置合理
- ✅ Robots.txt 指导爬虫正确爬取

### 性能优化: ✅

- ✅ 1 小时缓存减少服务器负载
- ✅ CDN 缓存支持
- ✅ 并行查询数据库
- ✅ 错误时返回静态内容

---

## 📝 下一步

1. **生产环境测试**:
   - 设置正确的 `NEXT_PUBLIC_SITE_URL`
   - 提交 Sitemap 到 Google Search Console
   - 监控 SEO 效果

2. **优化建议**:
   - 考虑实现 Sitemap 索引(如果 URL 超过 50,000)
   - 添加多语言 Sitemap 支持
   - 实现 IndexNow 协议快速通知搜索引擎

3. **监控**:
   - 定期检查 Sitemap 是否正常生成
   - 监控搜索引擎爬取情况
   - 跟踪 SEO 排名变化

---

**测试日期**: 2025-11-05
**测试人员**: AI Assistant
**测试状态**: ✅ 通过
