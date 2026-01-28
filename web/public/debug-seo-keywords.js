/**
 * SEO Keywords Debugger
 * Run this in browser console to see where keywords are distributed
 *
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Paste this entire script in Console
 * 3. Press Enter
 */

(function() {
  console.clear();
  console.log('🔍 SEO Keywords Distribution Analyzer\n');
  console.log('═'.repeat(80));

  const results = {
    imgAlts: [],
    linkTitles: [],
    ariaLabels: [],
    ariaDescribedby: [],
    imgTitles: [],
    placeholders: [],
    srOnlyLabels: [],
    dataCategory: [],
    dataLabel: [],
  };

  // 1. Image alt attributes
  document.querySelectorAll('img[alt]').forEach(img => {
    if (img.alt) {
      results.imgAlts.push({ element: img, value: img.alt });
    }
  });

  // 2. Link title attributes
  document.querySelectorAll('a[title]').forEach(link => {
    if (link.title) {
      results.linkTitles.push({ element: link, value: link.title });
    }
  });

  // 3. ARIA labels
  document.querySelectorAll('[aria-label]').forEach(el => {
    if (el.getAttribute('aria-label')) {
      results.ariaLabels.push({ element: el, value: el.getAttribute('aria-label') });
    }
  });

  // 4. ARIA describedby
  document.querySelectorAll('[aria-describedby]').forEach(el => {
    const id = el.getAttribute('aria-describedby');
    const desc = document.getElementById(id);
    if (desc) {
      results.ariaDescribedby.push({ element: el, value: desc.textContent, descElement: desc });
    }
  });

  // 5. Image title attributes
  document.querySelectorAll('img[title]').forEach(img => {
    if (img.title) {
      results.imgTitles.push({ element: img, value: img.title });
    }
  });

  // 6. Input/textarea placeholders
  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
    if (input.placeholder) {
      results.placeholders.push({ element: input, value: input.placeholder });
    }
  });

  // 7. Sr-only labels
  document.querySelectorAll('.sr-only').forEach(el => {
    if (el.textContent) {
      results.srOnlyLabels.push({ element: el, value: el.textContent.trim() });
    }
  });

  // 8. Data-category attributes
  document.querySelectorAll('[data-category]').forEach(el => {
    const value = el.getAttribute('data-category');
    if (value) {
      results.dataCategory.push({ element: el, value });
    }
  });

  // 9. Data-label attributes
  document.querySelectorAll('[data-label]').forEach(el => {
    const value = el.getAttribute('data-label');
    if (value) {
      results.dataLabel.push({ element: el, value });
    }
  });

  // Calculate totals
  const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  // Display summary
  console.log('\n📊 Distribution Summary:\n');
  console.log(`   Total Keywords: ${total}\n`);

  const displayResults = (name, items, color) => {
    console.log(`%c${name}: ${items.length}`, `color: ${color}; font-weight: bold`);
    if (items.length > 0) {
      console.log(`   First 3 examples:`);
      items.slice(0, 3).forEach((item, i) => {
        console.log(`   ${i + 1}. "${item.value}"`);
      });
      if (items.length > 3) {
        console.log(`   ... and ${items.length - 3} more`);
      }
      console.log('');
    }
  };

  displayResults('📷 Image Alt', results.imgAlts, '#3b82f6');
  displayResults('🔗 Link Titles', results.linkTitles, '#8b5cf6');
  displayResults('♿ ARIA Labels', results.ariaLabels, '#10b981');
  displayResults('📝 ARIA Describedby', results.ariaDescribedby, '#06b6d4');
  displayResults('🖼️  Image Titles', results.imgTitles, '#f59e0b');
  displayResults('✏️  Placeholders', results.placeholders, '#ec4899');
  displayResults('👁️  SR-only Labels', results.srOnlyLabels, '#6366f1');
  displayResults('🏷️  Data-category', results.dataCategory, '#14b8a6');
  displayResults('🔖 Data-label', results.dataLabel, '#84cc16');

  console.log('═'.repeat(80));
  console.log('\n💡 Tips:');
  console.log('   • Inspect any element in DevTools to see its attributes');
  console.log('   • Use: window.seoKeywords to access all results');
  console.log('   • Example: window.seoKeywords.imgAlts[0].element\n');

  // Make results globally accessible
  window.seoKeywords = results;

  // Create a summary object
  const summary = {
    total,
    breakdown: {
      'img[alt]': results.imgAlts.length,
      'a[title]': results.linkTitles.length,
      '[aria-label]': results.ariaLabels.length,
      '[aria-describedby]': results.ariaDescribedby.length,
      'img[title]': results.imgTitles.length,
      '[placeholder]': results.placeholders.length,
      '.sr-only': results.srOnlyLabels.length,
      '[data-category]': results.dataCategory.length,
      '[data-label]': results.dataLabel.length,
    }
  };

  console.log('📋 Summary Object:');
  console.table(summary.breakdown);

  return summary;
})();
