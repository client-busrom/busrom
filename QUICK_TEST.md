# 快速测试 - 多关键词分布策略

## 一键测试

### 1. 访问首页
```
http://localhost:3001/en
```

### 2. 打开开发者工具
- Mac: `Cmd + Option + I`
- Windows: `F12`

### 3. 运行测试（等待 1 秒后自动测试）

在 Console 中粘贴并回车：

```javascript
setTimeout(() => {
  fetch('/test-multi-keyword-distribution.js').then(r => r.text()).then(eval)
}, 1000)
```

---

## 预期结果

应该看到：

```
✅ 预期关键词数: 1572
✅ 实际关键词数: 1572
✅ 成功率: 100.0%

✅ 完美！所有关键词都已成功分布！
```

**关键指标**:
- 总关键词数必须是 **1572**
- 成功率必须是 **100.0%**
- `img[alt]` 和 `img[title]` 应该占大头（约 40% 各）
- `.sr-only` 占比应该很小（<5%）

---

## 如果结果不对

### 问题 1: 总数不是 1572

**原因**: 关键词还没分布完成

**解决**:
```javascript
// 再等 1 秒重试
setTimeout(() => {
  fetch('/test-multi-keyword-distribution.js').then(r => r.text()).then(eval)
}, 1000)
```

### 问题 2: 还是有 Hydration 警告

**原因**: 浏览器缓存了旧版本

**解决**:
1. 硬刷新: `Cmd + Shift + R` (Mac) 或 `Ctrl + Shift + F5` (Windows)
2. 或者清除缓存重启浏览器

### 问题 3: sr-only 占比太高 (>20%)

**原因**: 页面元素太少

**检查**:
```javascript
console.log('图片数量:', document.querySelectorAll('img').length)
console.log('链接数量:', document.querySelectorAll('a').length)
```

如果图片 < 50 或链接 < 10，说明页面还没完全加载。

---

## 查看实际效果

### 查看图片 alt 属性

```javascript
// 随机查看一个图片的 alt (应该包含多个关键词)
const img = document.querySelector('img[alt]')
if (img) {
  const keywords = img.alt.split(',').map(k => k.trim()).filter(k => k)
  console.log(`这个图片包含 ${keywords.length} 个关键词:`)
  console.log(img.alt)
}
```

预期输出类似:
```
这个图片包含 10 个关键词:
glass standoff, stainless steel fitting, balustrade hardware, architectural glass accessories, premium quality products, custom design solutions, OEM manufacturer, ODM service, professional hardware, global shipping
```

### 查看链接 title 属性

```javascript
// 随机查看一个链接的 title
const link = document.querySelector('a[title]')
if (link) {
  const keywords = link.title.split(',').map(k => k.trim()).filter(k => k)
  console.log(`这个链接包含 ${keywords.length} 个关键词:`)
  console.log(link.title)
}
```

### 验证没有 meta keywords 标签

```javascript
// 应该是 0
console.log('Meta keywords 数量:', document.querySelectorAll('meta[name*="keyword"]').length)
```

---

## 成功标准

✅ 总关键词数 = 1572
✅ 成功率 = 100%
✅ 没有 Hydration 警告
✅ 没有 `<meta name="keywords">` 标签
✅ 每个 img alt 包含 3-10 个关键词
✅ 关键词分布在正常 HTML 属性中（不只是 sr-only）

---

## 完整文档

详细测试指南: `TEST_MULTI_KEYWORD_STRATEGY.md`
