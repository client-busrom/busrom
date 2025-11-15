const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check2FA() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@busrom.com' },
      select: {
        email: true,
        name: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (user) {
      console.log('\n=== 2FA Status for admin@busrom.com ===');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('2FA Enabled:', user.twoFactorEnabled);
      console.log('Has 2FA Secret:', !!user.twoFactorSecret);
      console.log('=====================================\n');
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check2FA();
