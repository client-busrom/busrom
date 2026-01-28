/**
 * Test Multi-Keyword Distribution Strategy
 * 测试每个属性可以放置多个关键词的新策略
 */

(function() {
  console.clear();
  console.log('🔍 多关键词分布策略测试\n');
  console.log('═'.repeat(80));

  const results = {
    imgAlts: [],
    imgTitles: [],
    linkTitles: [],
    ariaLabels: [],
    ariaDescribedby: [],
    placeholders: [],
    dataCategory: [],
    dataLabel: [],
    srOnly: [],
  };

  // 收集所有分布的关键词
  document.querySelectorAll('img[alt]').forEach(img => {
    if (img.alt && img.alt.trim()) {
      // 按逗号分割，每个属性可能包含多个关键词
      const keywords = img.alt.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.imgAlts.push(...keywords);
    }
  });

  document.querySelectorAll('img[title]').forEach(img => {
    if (img.title && img.title.trim()) {
      const keywords = img.title.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.imgTitles.push(...keywords);
    }
  });

  document.querySelectorAll('a[title]').forEach(a => {
    if (a.title && a.title.trim()) {
      const keywords = a.title.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.linkTitles.push(...keywords);
    }
  });

  document.querySelectorAll('[aria-label]').forEach(el => {
    const label = el.getAttribute('aria-label');
    if (label && label.trim()) {
      const keywords = label.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.ariaLabels.push(...keywords);
    }
  });

  document.querySelectorAll('[aria-describedby]').forEach(el => {
    const id = el.getAttribute('aria-describedby');
    const desc = document.getElementById(id);
    if (desc && desc.textContent && desc.textContent.trim()) {
      const keywords = desc.textContent.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.ariaDescribedby.push(...keywords);
    }
  });

  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
    if (input.placeholder && input.placeholder.trim()) {
      const keywords = input.placeholder.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.placeholders.push(...keywords);
    }
  });

  document.querySelectorAll('[data-category]').forEach(el => {
    const value = el.getAttribute('data-category');
    if (value && value.trim()) {
      const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.dataCategory.push(...keywords);
    }
  });

  document.querySelectorAll('[data-label]').forEach(el => {
    const value = el.getAttribute('data-label');
    if (value && value.trim()) {
      const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.dataLabel.push(...keywords);
    }
  });

  document.querySelectorAll('.sr-only').forEach(el => {
    if (el.textContent && el.textContent.trim()) {
      const keywords = el.textContent.split(',').map(k => k.trim()).filter(k => k.length > 0);
      results.srOnly.push(...keywords);
    }
  });

  // 统计
  const counts = {
    'img[alt]': results.imgAlts.length,
    'img[title]': results.imgTitles.length,
    'a[title]': results.linkTitles.length,
    '[aria-label]': results.ariaLabels.length,
    '[aria-describedby]': results.ariaDescribedby.length,
    '[placeholder]': results.placeholders.length,
    '[data-category]': results.dataCategory.length,
    '[data-label]': results.dataLabel.length,
    '.sr-only': results.srOnly.length,
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  console.log(`\n📈 分布统计:\n`);
  console.log(`   总关键词数: ${total}\n`);

  // 柱状图
  Object.entries(counts).forEach(([key, count]) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const barLength = Math.floor(count / 20);
    const bar = '█'.repeat(barLength);
    console.log(`   ${key.padEnd(20)} ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
  });

  console.log('\n' + '═'.repeat(80));

  // 预期 vs 实际
  const expected = 1572;
  const actual = total;
  const successRate = ((actual / expected) * 100).toFixed(1);

  console.log(`\n✅ 预期关键词数: ${expected}`);
  console.log(`${actual === expected ? '✅' : actual > expected * 0.95 ? '⚠️' : '❌'}  实际关键词数: ${actual}`);
  console.log(`${successRate === '100.0' ? '✅' : parseFloat(successRate) > 95 ? '⚠️' : '❌'}  成功率: ${successRate}%`);

  if (actual < expected) {
    const missing = expected - actual;
    console.log(`\n⚠️  缺失 ${missing} 个关键词 (${((missing / expected) * 100).toFixed(1)}%)`);
  } else if (actual > expected) {
    console.log(`\n⚠️  超出预期 ${actual - expected} 个关键词`);
  } else {
    console.log(`\n✅ 完美！所有关键词都已成功分布！`);
  }

  console.log('\n' + '═'.repeat(80));

  // 元素统计
  console.log(`\n🏷️  元素使用情况:\n`);

  const elementCounts = {
    '图片数量 (img)': document.querySelectorAll('img').length,
    '链接数量 (a)': document.querySelectorAll('a').length,
    '交互元素 (button, nav a)': document.querySelectorAll('button, nav a').length,
    '输入框 (input, textarea)': document.querySelectorAll('input[type="text"], textarea').length,
    '结构化元素 (section, article, div.container, div.card)': document.querySelectorAll('section, article, div[class*="container"], div[class*="card"]').length,
    '通用元素 (div, nav, footer, header, main)': document.querySelectorAll('div, nav, footer, header, main').length,
    'sr-only 元素': document.querySelectorAll('.sr-only').length,
  };

  Object.entries(elementCounts).forEach(([key, count]) => {
    console.log(`   ${key.padEnd(50)} ${count.toString().padStart(4)}`);
  });

  console.log('\n' + '═'.repeat(80));

  // 每个属性平均关键词数
  console.log(`\n📊 每个属性平均关键词数:\n`);

  const avgStats = [
    {
      name: 'img[alt]',
      elementCount: document.querySelectorAll('img[alt]').length,
      keywordCount: results.imgAlts.length
    },
    {
      name: 'img[title]',
      elementCount: document.querySelectorAll('img[title]').length,
      keywordCount: results.imgTitles.length
    },
    {
      name: 'a[title]',
      elementCount: document.querySelectorAll('a[title]').length,
      keywordCount: results.linkTitles.length
    },
    {
      name: '[aria-label]',
      elementCount: document.querySelectorAll('[aria-label]').length,
      keywordCount: results.ariaLabels.length
    },
    {
      name: '[placeholder]',
      elementCount: document.querySelectorAll('[placeholder]').length,
      keywordCount: results.placeholders.length
    },
    {
      name: '[data-category]',
      elementCount: document.querySelectorAll('[data-category]').length,
      keywordCount: results.dataCategory.length
    },
    {
      name: '[data-label]',
      elementCount: document.querySelectorAll('[data-label]').length,
      keywordCount: results.dataLabel.length
    },
    {
      name: '.sr-only',
      elementCount: document.querySelectorAll('.sr-only').length,
      keywordCount: results.srOnly.length
    },
  ];

  avgStats.forEach(stat => {
    const avg = stat.elementCount > 0 ? (stat.keywordCount / stat.elementCount).toFixed(1) : '0.0';
    console.log(`   ${stat.name.padEnd(20)} ${stat.elementCount.toString().padStart(3)} 个元素, ${stat.keywordCount.toString().padStart(4)} 个关键词, 平均 ${avg} 个/元素`);
  });

  console.log('\n' + '═'.repeat(80));

  // 示例关键词
  console.log(`\n📝 示例 (查看每个属性包含多少关键词):\n`);

  // 随机选一个图片的 alt
  const sampleImg = document.querySelector('img[alt]');
  if (sampleImg) {
    const altKeywords = sampleImg.alt.split(',').map(k => k.trim()).filter(k => k.length > 0);
    console.log(`   示例图片 alt (包含 ${altKeywords.length} 个关键词):`);
    console.log(`   "${sampleImg.alt.substring(0, 100)}${sampleImg.alt.length > 100 ? '...' : ''}"`);
    console.log('');
  }

  // 随机选一个链接的 title
  const sampleLink = document.querySelector('a[title]');
  if (sampleLink) {
    const titleKeywords = sampleLink.title.split(',').map(k => k.trim()).filter(k => k.length > 0);
    console.log(`   示例链接 title (包含 ${titleKeywords.length} 个关键词):`);
    console.log(`   "${sampleLink.title.substring(0, 100)}${sampleLink.title.length > 100 ? '...' : ''}"`);
    console.log('');
  }

  // 随机选一个 data-category
  const sampleData = document.querySelector('[data-category]');
  if (sampleData) {
    const dataKeywords = sampleData.getAttribute('data-category').split(',').map(k => k.trim()).filter(k => k.length > 0);
    console.log(`   示例 data-category (包含 ${dataKeywords.length} 个关键词):`);
    console.log(`   "${sampleData.getAttribute('data-category').substring(0, 100)}${sampleData.getAttribute('data-category').length > 100 ? '...' : ''}"`);
    console.log('');
  }

  console.log('═'.repeat(80));
  console.log('\n💾 结果已保存到: window.multiKeywordTest');

  // 保存到 window
  window.multiKeywordTest = {
    counts,
    total,
    expected,
    successRate: parseFloat(successRate),
    elementCounts,
    avgStats,
    results,
  };

  return {
    total,
    expected,
    successRate: parseFloat(successRate),
    breakdown: counts,
  };
})();
