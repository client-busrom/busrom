/**
 * Comprehensive SEO Distribution Report
 * Shows exactly how keywords were distributed across the page
 */

(function() {
  console.clear();
  console.log('📊 SEO Keywords Distribution Report\n');
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

  // Collect all distributed keywords
  document.querySelectorAll('img[alt]').forEach(img => {
    if (img.alt && img.alt.trim()) {
      results.imgAlts.push(img.alt);
    }
  });

  document.querySelectorAll('img[title]').forEach(img => {
    if (img.title && img.title.trim()) {
      results.imgTitles.push(img.title);
    }
  });

  document.querySelectorAll('a[title]').forEach(a => {
    if (a.title && a.title.trim()) {
      results.linkTitles.push(a.title);
    }
  });

  document.querySelectorAll('[aria-label]').forEach(el => {
    const label = el.getAttribute('aria-label');
    if (label && label.trim()) {
      results.ariaLabels.push(label);
    }
  });

  document.querySelectorAll('[aria-describedby]').forEach(el => {
    const id = el.getAttribute('aria-describedby');
    const desc = document.getElementById(id);
    if (desc && desc.textContent && desc.textContent.trim()) {
      results.ariaDescribedby.push(desc.textContent.trim());
    }
  });

  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
    if (input.placeholder && input.placeholder.trim()) {
      results.placeholders.push(input.placeholder);
    }
  });

  document.querySelectorAll('[data-category]').forEach(el => {
    const value = el.getAttribute('data-category');
    if (value && value.trim()) {
      results.dataCategory.push(value);
    }
  });

  document.querySelectorAll('[data-label]').forEach(el => {
    const value = el.getAttribute('data-label');
    if (value && value.trim()) {
      results.dataLabel.push(value);
    }
  });

  document.querySelectorAll('.sr-only').forEach(el => {
    if (el.textContent && el.textContent.trim()) {
      results.srOnly.push(el.textContent.trim());
    }
  });

  // Calculate totals
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

  console.log(`\n📈 Distribution Summary:\n`);
  console.log(`   Total Keywords Distributed: ${total}\n`);

  // Create bar chart
  Object.entries(counts).forEach(([key, count]) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const barLength = Math.floor(count / 20); // Scale for display
    const bar = '█'.repeat(barLength);
    console.log(`   ${key.padEnd(20)} ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
  });

  console.log('\n' + '═'.repeat(80));

  // Expected vs Actual
  const expected = 1572; // From backend test
  const actual = total;
  const successRate = ((actual / expected) * 100).toFixed(1);

  console.log(`\n✅ Expected: ${expected} keywords`);
  console.log(`${actual === expected ? '✅' : '⚠️'}  Actual:   ${actual} keywords`);
  console.log(`${successRate === '100.0' ? '✅' : '⚠️'}  Success:  ${successRate}%`);

  if (actual < expected) {
    console.log(`\n❌ Missing ${expected - actual} keywords!`);
    console.log(`\n💡 Possible reasons:`);
    console.log(`   1. useEffect hasn't run yet (refresh and check again)`);
    console.log(`   2. Not enough elements on page`);
    console.log(`   3. Distribution logic has a bug`);
  } else if (actual > expected) {
    console.log(`\n⚠️  More keywords than expected! Check for duplicates.`);
  } else {
    console.log(`\n✅ Perfect! All keywords distributed successfully!`);
  }

  console.log('\n' + '═'.repeat(80));

  // Sample keywords from each category
  console.log(`\n📝 Sample Keywords (first 3 from each category):\n`);

  Object.entries(results).forEach(([key, values]) => {
    if (values.length > 0) {
      console.log(`   ${key}:`);
      values.slice(0, 3).forEach((val, i) => {
        const preview = val.length > 60 ? val.substring(0, 57) + '...' : val;
        console.log(`      ${i + 1}. "${preview}"`);
      });
      if (values.length > 3) {
        console.log(`      ... and ${values.length - 3} more`);
      }
      console.log('');
    }
  });

  console.log('═'.repeat(80));
  console.log('\n💾 Results saved to: window.seoDistributionReport');

  // Save to window for further inspection
  window.seoDistributionReport = {
    counts,
    total,
    expected,
    successRate,
    results,
  };

  return {
    total,
    expected,
    successRate: parseFloat(successRate),
    breakdown: counts,
  };
})();
