#!/usr/bin/env node

/**
 * Watch and Patch Auth Pages
 *
 * Monitors the auto-generated auth pages and patches them whenever they change.
 * This is needed because Keystone regenerates them in dev mode.
 */

const fs = require('fs');
const path = require('path');

const signinPath = path.join(__dirname, '../.keystone/admin/pages/signin.js');
const initPath = path.join(__dirname, '../.keystone/admin/pages/init.js');

const signinContent = `export { default } from '../../../admin/pages/signin'\n`;
const initContent = `export { default } from '../../../admin/pages/init'\n`;

function patchFile(filePath, content, name) {
  try {
    if (fs.existsSync(filePath)) {
      const currentContent = fs.readFileSync(filePath, 'utf8');

      // Only patch if it's not already using our custom page
      if (!currentContent.includes("export { default } from '../../../admin/pages/")) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Patched ${name} to use custom branded page`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`❌ Failed to patch ${name}:`, error.message);
    return false;
  }
}

function patchAll() {
  const signinPatched = patchFile(signinPath, signinContent, 'signin.js');
  const initPatched = patchFile(initPath, initContent, 'init.js');

  if (signinPatched || initPatched) {
    console.log('🎨 Custom auth pages activated!\n');
  }
}

// Initial patch
console.log('\n🔧 Starting auth pages watcher...\n');
patchAll();

// Watch for changes
const keystoneDir = path.join(__dirname, '../.keystone/admin/pages');

if (fs.existsSync(keystoneDir)) {
  fs.watch(keystoneDir, (eventType, filename) => {
    if (filename === 'signin.js' || filename === 'init.js') {
      // Small delay to let Keystone finish writing
      setTimeout(() => {
        patchAll();
      }, 100);
    }
  });

  console.log('👀 Watching for Keystone auth page regeneration...\n');
} else {
  console.log('⚠️  .keystone/admin/pages directory not found yet\n');
}

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n\n👋 Auth pages watcher stopped\n');
  process.exit(0);
});
