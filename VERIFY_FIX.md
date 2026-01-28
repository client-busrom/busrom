# 验证修复

## 快速验证步骤

### 1. 确保服务在运行

```bash
# 终端 1: CMS (如果还没运行)
cd payload-cms && npm run dev

# 终端 2: 前端 (如果还没运行)
cd web && npm run dev
```

### 2. 访问页面

打开浏览器访问: http://localhost:3001/en

### 3. 运行诊断脚本

打开浏览器开发者工具 (F12)，在 Console 中运行:

```javascript
fetch('/seo-distribution-report.js').then(r => r.text()).then(eval)
```

### 4. 查看结果

**修复前 (预期看到的问题)**:
```
Total Keywords Distributed: 259
❌ Expected: 1572 keywords
⚠️  Actual:   259 keywords
⚠️  Success:  16.5%
```

**修复后 (预期看到的结果)**:
```
Total Keywords Distributed: 1572
✅ Expected: 1572 keywords
✅ Actual:   1572 keywords
✅ Success:  100.0%
```

## 详细检查

### 查看分布明细

控制台会显示每个类别的分布情况:

```
📊 Distribution Summary:

   img[alt]              250 (15.9%) ████████████
   img[title]            250 (15.9%) ████████████
   a[title]               80 ( 5.1%) ████
   [aria-label]           30 ( 1.9%) █
   [placeholder]           5 ( 0.3%)
   [data-category]       150 ( 9.5%) ███████
   [data-label]          300 (19.1%) ███████████████
   [aria-describedby]     80 ( 5.1%) ████
   .sr-only              427 (27.2%) █████████████████████
```

**关键点**:
- 总数必须是 1572
- `.sr-only` 会包含所有剩余关键词（通常是最多的）
- 其他类别根据页面实际元素数量分布

### 验证关键词内容

```javascript
// 查看保存的结果
window.seoDistributionReport

// 查看前3个 img alt 关键词
window.seoDistributionReport.results.imgAlts.slice(0, 3)

// 查看所有 sr-only 关键词
window.seoDistributionReport.results.srOnly
```

### 验证页面源代码

1. 右键 → 查看页面源代码
2. 搜索 `<meta name="keywords"`
3. **应该找不到任何结果** ✅

关键词应该分散在:
- `<img alt="...">`
- `<a title="...">`
- `<div data-category="...">`
- `<span class="sr-only">...</span>`
- 等等

## 如果结果不对

### 可能原因 1: useEffect 还没运行

**解决**: 刷新页面 (Cmd+R / F5)，然后重新运行脚本

### 可能原因 2: Next.js 缓存

**解决**:
```bash
# 清除 Next.js 缓存
cd web
rm -rf .next
npm run dev
```

### 可能原因 3: 浏览器缓存

**解决**: 硬刷新 (Cmd+Shift+R / Ctrl+Shift+R)

## 成功标准

✅ Total = 1572 keywords
✅ Success rate = 100%
✅ 没有 `<meta name="keywords">` 标签
✅ 所有关键词分散在各种 HTML 属性中

## 对比其他页面

### 测试非首页

访问: http://localhost:3001/en/products/glass-standoffs

运行同样的诊断脚本，应该看到:
- 使用最高优先级 SEO 配置的 title/description
- 分布该配置的关键词 + 其他匹配配置的所有文本
- 总数会不同（取决于有多少匹配配置）

### 测试无匹配页面

访问: http://localhost:3001/en/some-random-page

运行同样的诊断脚本，应该看到:
- 使用 global 配置的 title/description
- 分布 global 的 68 个关键词
- Total = 68 keywords, Success = 100%

## 其他诊断工具

### 检查可用元素容量

```javascript
fetch('/diagnose-element-capacity.js').then(r => r.text()).then(eval)
```

### 高亮所有包含关键词的元素

参考 `SEO_KEYWORDS_DEBUG_GUIDE.md` 中的"方法 3"

### 导出所有关键词到 CSV

参考 `SEO_KEYWORDS_DEBUG_GUIDE.md` 中的"方法 4"
