#!/usr/bin/env node
/**
 * Direct database script to clear all users
 * Run this inside ECS task with AWS ECS Execute Command
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Clearing User table...\n');

  try {
    // Count users before deletion
    const countBefore = await prisma.user.count();
    console.log(`Found ${countBefore} user(s) in database`);

    if (countBefore === 0) {
      console.log('\n✅ No users to delete. Database is already clean.');
      return;
    }

    // Delete all users
    const deleteResult = await prisma.user.deleteMany({});
    console.log(`\n🗑️  Deleted ${deleteResult.count} user(s)`);

    // Verify deletion
    const countAfter = await prisma.user.count();
    console.log(`✅ Remaining users: ${countAfter}`);

    if (countAfter === 0) {
      console.log('\n🎉 SUCCESS! User table is now empty. You can register a new admin user.');
    } else {
      console.log(`\n⚠️  Warning: ${countAfter} users still remain in database`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
