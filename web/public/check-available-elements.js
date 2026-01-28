/**
 * Check how many elements are available for SEO keyword distribution
 */

(function() {
  console.clear();
  console.log('🔍 Checking Available Elements for SEO Keywords\n');
  console.log('═'.repeat(80));

  const counts = {
    // Current strategy (only elements WITHOUT attributes)
    current: {
      'img:not([alt])': document.querySelectorAll('img:not([alt])').length,
      'a:not([title])': document.querySelectorAll('a:not([title])').length,
      'button:not([aria-label])': document.querySelectorAll('button:not([aria-label])').length,
      'nav a:not([aria-label])': document.querySelectorAll('nav a:not([aria-label])').length,
      'img:not([title])': document.querySelectorAll('img:not([title])').length,
      'input[type="text"]:not([placeholder])': document.querySelectorAll('input[type="text"]:not([placeholder])').length,
      'textarea:not([placeholder])': document.querySelectorAll('textarea:not([placeholder])').length,
      'section, article, div': document.querySelectorAll('section, article, div[class*="card"]').length,
    },

    // Alternative strategy (ALL elements, can override)
    alternative: {
      'ALL img': document.querySelectorAll('img').length,
      'ALL a': document.querySelectorAll('a').length,
      'ALL button': document.querySelectorAll('button').length,
      'ALL input': document.querySelectorAll('input[type="text"], textarea').length,
      'ALL div/section/article': document.querySelectorAll('div, section, article, nav, footer, header, main').length,
    }
  };

  console.log('\n📊 Current Strategy (Only empty attributes):\n');
  let currentTotal = 0;
  Object.entries(counts.current).forEach(([selector, count]) => {
    console.log(`   ${selector.padEnd(40)} ${count}`);
    currentTotal += count;
  });
  console.log(`\n   Total available slots: ${currentTotal}`);

  console.log('\n\n📊 Alternative Strategy (All elements, can override):\n');
  let altTotal = 0;
  Object.entries(counts.alternative).forEach(([selector, count]) => {
    console.log(`   ${selector.padEnd(40)} ${count}`);
    altTotal += count;
  });
  console.log(`\n   Total available slots: ${altTotal}`);

  console.log('\n' + '═'.repeat(80));
  console.log('\n💡 Analysis:');
  console.log(`   Expected keywords to distribute: ~1558`);
  console.log(`   Current available slots: ${currentTotal}`);
  console.log(`   Alternative available slots: ${altTotal}`);

  if (currentTotal < 1558) {
    console.log(`\n   ⚠️  Current strategy can only fit ${currentTotal} keywords`);
    console.log(`   ⚠️  Missing capacity: ${1558 - currentTotal} keywords`);
    console.log(`\n   💡 Recommendation: Allow overriding existing attributes`);
  } else {
    console.log(`\n   ✅ Enough slots for all keywords!`);
  }
})();
