/**
 * Emergency script to disable 2FA for admin account
 * Run with: node disable-admin-2fa.js
 */

const { PrismaClient } = require('.prisma/client');

const prisma = new PrismaClient();

async function disableAdmin2FA() {
  try {
    console.log('\n🔧 Disabling 2FA for admin@busrom.com...\n');

    const result = await prisma.user.update({
      where: { email: 'admin@busrom.com' },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: '',
        backupCodes: [],
      },
      select: {
        email: true,
        name: true,
        twoFactorEnabled: true,
      },
    });

    console.log('✅ Success!');
    console.log('User:', result.name);
    console.log('Email:', result.email);
    console.log('2FA Enabled:', result.twoFactorEnabled);
    console.log('\n✨ You can now login without 2FA\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

disableAdmin2FA();
