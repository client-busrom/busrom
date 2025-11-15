#!/usr/bin/env node

/**
 * Patch Auto-Generated Auth Pages
 *
 * Keystone's createAuth automatically generates signin.js and init.js pages.
 * This script patches them to use our custom branded pages instead.
 */

const fs = require('fs');
const path = require('path');

const signinPath = path.join(__dirname, '../.keystone/admin/pages/signin.js');
const initPath = path.join(__dirname, '../.keystone/admin/pages/init.js');

const signinContent = `export { default } from '../../../admin/pages/signin'\n`;
const initContent = `export { default } from '../../../admin/pages/init'\n`;

try {
  // Patch signin.js
  if (fs.existsSync(signinPath)) {
    fs.writeFileSync(signinPath, signinContent, 'utf8');
    console.log('✅ Patched signin.js to use custom branded page');
  } else {
    console.log('⚠️  signin.js not found - will be created on first build');
  }

  // Patch init.js
  if (fs.existsSync(initPath)) {
    fs.writeFileSync(initPath, initContent, 'utf8');
    console.log('✅ Patched init.js to use custom branded page');
  } else {
    console.log('⚠️  init.js not found - will be created on first build');
  }

  console.log('\n🎨 Custom auth pages activated!\n');
} catch (error) {
  console.error('❌ Failed to patch auth pages:', error.message);
  process.exit(1);
}
