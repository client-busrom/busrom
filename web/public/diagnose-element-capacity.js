/**
 * Diagnose element capacity - check if we have enough elements
 * to distribute all 1572 keywords
 */

(function() {
  console.clear();
  console.log('🔍 Diagnosing Element Capacity for SEO Keywords\n');
  console.log('═'.repeat(80));

  const expected = {
    imgAlts: 471,
    linkTitles: 235,
    ariaLabels: 235,
    ariaDescribedby: 157,
    imgTitles: 157,
    placeholders: 125,
    srOnlyLabels: 78,
    dataAttributes: 78,
    metaTags: 36,
  };

  const totalExpected = Object.values(expected).reduce((a, b) => a + b, 0);

  console.log(`\n📊 Expected to distribute: ${totalExpected} keywords\n`);

  // Check what's available
  const available = {
    'img (for alt)': document.querySelectorAll('img').length,
    'a (for title)': document.querySelectorAll('a').length,
    'interactive (for aria-label)': document.querySelectorAll('button, nav a, a').length,
    'describable (section, article, div.card)': document.querySelectorAll('section, article, div[class*="card"]').length,
    'img (for title)': document.querySelectorAll('img').length,
    'inputs (text, textarea)': document.querySelectorAll('input[type="text"], textarea').length,
    'container divs (for data-category)': document.querySelectorAll('section, article, div[class*="container"]').length,
    'structural elements (for data-label)': document.querySelectorAll('div, section, article, nav, footer, header').length,
  };

  console.log('📈 Available Elements:\n');

  const checks = [
    { name: 'img[alt]', expected: expected.imgAlts, available: available['img (for alt)'] },
    { name: 'a[title]', expected: expected.linkTitles, available: available['a (for title)'] },
    { name: '[aria-label]', expected: expected.ariaLabels, available: available['interactive (for aria-label)'] },
    { name: '[aria-describedby]', expected: expected.ariaDescribedby, available: available['describable (section, article, div.card)'] },
    { name: 'img[title]', expected: expected.imgTitles, available: available['img (for title)'] },
    { name: '[placeholder]', expected: expected.placeholders, available: available['inputs (text, textarea)'] },
    { name: '[data-category]', expected: expected.dataAttributes, available: available['container divs (for data-category)'] },
    { name: '[data-label]', expected: expected.metaTags, available: available['structural elements (for data-label)'] },
  ];

  let totalCapacity = 0;
  let totalShortfall = 0;

  checks.forEach(check => {
    const status = check.available >= check.expected ? '✅' : '❌';
    const diff = check.available - check.expected;
    const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;

    console.log(`   ${status} ${check.name.padEnd(25)} Need: ${check.expected.toString().padStart(3)}  Available: ${check.available.toString().padStart(4)}  (${diffStr})`);

    if (check.available >= check.expected) {
      totalCapacity += check.expected;
    } else {
      totalCapacity += check.available;
      totalShortfall += (check.expected - check.available);
    }
  });

  // Sr-only labels don't need existing elements (we create them)
  totalCapacity += expected.srOnlyLabels;

  console.log('\n' + '═'.repeat(80));
  console.log(`\n📊 Capacity Analysis:`);
  console.log(`   Total expected:        ${totalExpected} keywords`);
  console.log(`   Total capacity:        ${totalCapacity} keywords`);
  console.log(`   Total shortfall:       ${totalShortfall} keywords`);
  console.log(`   Success rate:          ${((totalCapacity / totalExpected) * 100).toFixed(1)}%`);

  if (totalShortfall > 0) {
    console.log(`\n⚠️  WARNING: Not enough elements on the page!`);
    console.log(`   We can only fit ${totalCapacity} out of ${totalExpected} keywords.`);
    console.log(`\n💡 Solutions:`);
    console.log(`   1. Add more placeholder divs/sections to the page`);
    console.log(`   2. Use more aggressive selectors (less restrictive)`);
    console.log(`   3. Use data-* attributes more liberally`);
    console.log(`   4. Create more sr-only elements`);
  } else {
    console.log(`\n✅ Enough elements available to fit all keywords!`);
  }

  console.log('\n' + '═'.repeat(80));
})();
