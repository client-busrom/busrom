# SEO Keywords 调试指南

## 方法 1: 浏览器控制台脚本（推荐）

### 使用步骤：

1. **访问页面**
   打开 `http://localhost:3001/en` 或任何页面

2. **打开开发者工具**
   - Mac: `Cmd + Option + I`
   - Windows/Linux: `F12` 或 `Ctrl + Shift + I`

3. **运行调试脚本**
   在 Console 中粘贴并运行：
   ```javascript
   fetch('/debug-seo-keywords.js').then(r => r.text()).then(eval)
   ```

   或者直接访问：`http://localhost:3001/debug-seo-keywords.js` 复制代码到控制台运行

4. **查看结果**
   脚本会显示：
   - 📊 总计多少个关键词
   - 📷 图片 alt: X 个
   - 🔗 链接 title: X 个
   - ♿ ARIA labels: X 个
   - 等等...

5. **详细检查**
   ```javascript
   // 查看所有结果
   window.seoKeywords

   // 查看所有图片 alt
   window.seoKeywords.imgAlts

   // 高亮第一个元素
   window.seoKeywords.imgAlts[0].element.style.border = '3px solid red'
   ```

---

## 方法 2: 手动 DevTools 检查

### 1. 查看图片 alt 属性

**Console:**
```javascript
document.querySelectorAll('img[alt]').forEach((img, i) => {
  console.log(`${i + 1}. ${img.alt}`)
})
```

### 2. 查看链接 title 属性

**Console:**
```javascript
document.querySelectorAll('a[title]').forEach((a, i) => {
  console.log(`${i + 1}. ${a.title}`)
})
```

### 3. 查看 ARIA labels

**Console:**
```javascript
document.querySelectorAll('[aria-label]').forEach((el, i) => {
  console.log(`${i + 1}. ${el.getAttribute('aria-label')}`)
})
```

### 4. 查看 sr-only 元素

**Console:**
```javascript
document.querySelectorAll('.sr-only').forEach((el, i) => {
  console.log(`${i + 1}. ${el.textContent.trim()}`)
})
```

### 5. 查看 data-* 属性

**Console:**
```javascript
// data-category
document.querySelectorAll('[data-category]').forEach((el, i) => {
  console.log(`${i + 1}. ${el.getAttribute('data-category')}`)
})

// data-label
document.querySelectorAll('[data-label]').forEach((el, i) => {
  console.log(`${i + 1}. ${el.getAttribute('data-label')}`)
})
```

---

## 方法 3: 高亮所有包含 SEO 关键词的元素

粘贴到 Console：

```javascript
// 高亮所有有 SEO 关键词的元素
const highlightColor = '#ffeb3b';
const borderStyle = '2px solid #ff5722';

document.querySelectorAll('img[alt]').forEach(el => {
  el.style.border = borderStyle;
});

document.querySelectorAll('a[title]').forEach(el => {
  el.style.backgroundColor = highlightColor;
});

document.querySelectorAll('[aria-label]').forEach(el => {
  el.style.outline = '2px dashed #2196f3';
});

document.querySelectorAll('.sr-only').forEach(el => {
  el.style.position = 'relative';
  el.style.width = 'auto';
  el.style.height = 'auto';
  el.style.backgroundColor = '#4caf50';
  el.style.color = 'white';
  el.style.padding = '2px 5px';
});

console.log('✅ SEO elements highlighted!');
console.log('🟡 Yellow background = Link titles');
console.log('🔴 Red border = Image alts');
console.log('🔵 Blue dashed outline = ARIA labels');
console.log('🟢 Green boxes = SR-only labels (now visible)');
```

---

## 方法 4: 导出所有关键词到 CSV

```javascript
(function() {
  const keywords = [];

  document.querySelectorAll('img[alt]').forEach(img => {
    keywords.push({ type: 'img-alt', value: img.alt, element: 'img' });
  });

  document.querySelectorAll('a[title]').forEach(a => {
    keywords.push({ type: 'link-title', value: a.title, element: 'a' });
  });

  document.querySelectorAll('[aria-label]').forEach(el => {
    keywords.push({ type: 'aria-label', value: el.getAttribute('aria-label'), element: el.tagName });
  });

  document.querySelectorAll('.sr-only').forEach(el => {
    keywords.push({ type: 'sr-only', value: el.textContent.trim(), element: el.tagName });
  });

  document.querySelectorAll('[data-category]').forEach(el => {
    keywords.push({ type: 'data-category', value: el.getAttribute('data-category'), element: el.tagName });
  });

  document.querySelectorAll('[data-label]').forEach(el => {
    keywords.push({ type: 'data-label', value: el.getAttribute('data-label'), element: el.tagName });
  });

  // Convert to CSV
  const csv = [
    'Type,Keyword,Element',
    ...keywords.map(k => `"${k.type}","${k.value}","${k.element}"`)
  ].join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'seo-keywords-distribution.csv';
  a.click();

  console.log(`✅ Exported ${keywords.length} keywords to CSV`);
})();
```

---

## 方法 5: 统计分析

```javascript
(function() {
  const stats = {
    'img[alt]': document.querySelectorAll('img[alt]').length,
    'a[title]': document.querySelectorAll('a[title]').length,
    '[aria-label]': document.querySelectorAll('[aria-label]').length,
    '[aria-describedby]': document.querySelectorAll('[aria-describedby]').length,
    'img[title]': document.querySelectorAll('img[title]').length,
    '[placeholder]': document.querySelectorAll('[placeholder]').length,
    '.sr-only': document.querySelectorAll('.sr-only').length,
    '[data-category]': document.querySelectorAll('[data-category]').length,
    '[data-label]': document.querySelectorAll('[data-label]').length,
  };

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  console.log('\n📊 SEO Keywords Distribution Stats\n');
  console.log(`Total: ${total} keywords\n`);

  Object.entries(stats).forEach(([key, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(percentage / 2));
    console.log(`${key.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%) ${bar}`);
  });
})();
```

---

## 预期结果（基于当前配置）

对于首页，你应该看到大约 **1572 个关键词** 被分布到页面中。

**注意**: 新的分布策略是基于可用元素，而不是固定百分比。分布顺序为：
1. 所有 img 元素 (alt 属性)
2. 所有 a 元素 (title 属性)
3. 所有交互元素 (aria-label)
4. 所有 img 元素 (title 属性)
5. 所有 input/textarea (placeholder)
6. 所有结构化元素 (data-category)
7. 所有通用元素 (data-label)
8. 部分元素 (aria-describedby + sr-only)
9. 剩余关键词全部变成独立的 sr-only 元素

这样保证 **100% 的关键词都会被分布**，不会浪费任何关键词。

---

## 验证 SEO 效果

### 1. 检查是否有 meta keywords 标签

```javascript
const metaKeywords = document.querySelector('meta[name="keywords"]');
console.log('Has meta keywords?', !!metaKeywords); // Should be false
```

### 2. 检查页面源代码

- 右键 → 查看页面源代码
- 搜索 `<meta name="keywords"`
- **应该找不到任何结果** ✅

### 3. 检查是否所有关键词都被分散

```javascript
// 这个数字应该接近 SEO settings 中的总关键词数
const totalDistributed =
  document.querySelectorAll('img[alt], a[title], [aria-label], .sr-only, [data-category], [data-label]').length;

console.log(`Total distributed keywords: ${totalDistributed}`);
```

---

## 常见问题

**Q: 为什么看不到 sr-only 元素？**
A: 它们被 CSS 隐藏了（用于屏幕阅读器），运行方法3的高亮脚本可以让它们可见。

**Q: 如何确认关键词确实在页面上？**
A: 使用方法1的调试脚本，它会列出所有关键词和位置。

**Q: 关键词数量对不上怎么办？**
A: 有些元素可能还没有渲染，或者页面内容不够多。客户端脚本在 useEffect 中运行，需要等页面加载完成。

---

## 下一步

1. 运行 `node test-new-seo-logic.mjs` 查看预期分布
2. 访问 `http://localhost:3001/en`
3. 运行方法1的调试脚本
4. 对比实际分布与预期分布

