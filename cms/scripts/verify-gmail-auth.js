/**
 * Gmail SMTP Authentication Tester
 *
 * This script tests if your Gmail credentials are correct
 * without sending any actual email.
 *
 * Run: node scripts/verify-gmail-auth.js
 */

const nodemailer = require('nodemailer');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('Gmail SMTP Authentication Tester');
console.log('========================================\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testGmailAuth() {
  try {
    // Get credentials
    const email = await question('Gmail address (e.g., your@gmail.com): ');
    const password = await question('App-Specific Password (16 chars, no spaces): ');

    console.log('\n📧 Testing SMTP connection...\n');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password.substring(0, 4)}${'*'.repeat(password.length - 4)}`);
    console.log('Host: smtp.gmail.com:587\n');

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
      logger: true,
      debug: true,
    });

    console.log('🔌 Verifying connection...\n');

    // Verify connection
    await transporter.verify();

    console.log('\n✅ ✅ ✅ SUCCESS! ✅ ✅ ✅');
    console.log('\nYour Gmail credentials are correct!');
    console.log('You can now use these credentials in CMS Site Config.\n');

  } catch (error) {
    console.log('\n❌ ❌ ❌ FAILED! ❌ ❌ ❌\n');
    console.log('Authentication failed. Error:', error.message);
    console.log('\n📝 Common issues:\n');
    console.log('1. Password is incorrect or has extra characters');
    console.log('   - Make sure you copied all 16 characters');
    console.log('   - Remove any spaces or newlines');
    console.log('\n2. Not using App-Specific Password');
    console.log('   - Generate new one at: https://myaccount.google.com/apppasswords');
    console.log('\n3. Two-Step Verification not enabled');
    console.log('   - Enable at: https://myaccount.google.com/security');
    console.log('\n4. Account has special security restrictions');
    console.log('   - Check Google Account security settings\n');
  } finally {
    rl.close();
  }
}

testGmailAuth();
