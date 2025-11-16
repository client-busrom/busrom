#!/usr/bin/env node
/**
 * Clear all users from staging database
 * This script should be run from AWS ECS or EC2
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking current User data in staging...\n');

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
  console.log('\n✅ Database is now clean. You can register a new admin user.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
