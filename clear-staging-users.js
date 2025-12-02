const { PrismaClient } = require('./cms/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://busrom_dev_user:busrom_dev_password@database-staging.cuvyzljvzrxy.us-east-1.rds.amazonaws.com:5432/busrom_cms"
    }
  }
});

async function main() {
  console.log('🔍 Checking current User data...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      status: true,
      createdAt: true
    }
  });

  console.log(`Found ${users.length} user(s):`);
  users.forEach(user => {
    console.log(`  - ID: ${user.id}, Email: ${user.email}, Admin: ${user.isAdmin}, Status: ${user.status}`);
  });

  if (users.length === 0) {
    console.log('\n✅ No users to delete. Database is already clean.');
    return;
  }

  console.log('\n🗑️  Deleting all users...');

  const deleteResult = await prisma.user.deleteMany({});

  console.log(`✅ Deleted ${deleteResult.count} user(s) successfully.`);

  // Verify deletion
  const remainingUsers = await prisma.user.count();
  console.log(`\n✅ Verification: ${remainingUsers} user(s) remaining in database.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
