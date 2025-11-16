/**
 * EMERGENCY: Force clear all users
 * This endpoint will IMMEDIATELY delete all users without confirmation
 * Use with extreme caution!
 */

import type { Request } from 'express';

export default async function forceClearUsers(req: Request, context: any) {
  const { prisma } = context;

  // Security: Only allow in non-production
  if (process.env.NODE_ENV === 'production') {
    return {
      status: 403,
      text: 'Not available in production',
    };
  }

  try {
    console.log('🚨 FORCE CLEARING ALL USERS...');

    // Count before
    const countBefore = await prisma.user.count();
    console.log(`Found ${countBefore} user(s)`);

    // Delete ALL users
    const result = await prisma.user.deleteMany({});
    console.log(`Deleted ${result.count} user(s)`);

    // Count after
    const countAfter = await prisma.user.count();
    console.log(`Remaining: ${countAfter} user(s)`);

    return {
      status: 200,
      text: `SUCCESS: Deleted ${result.count} users. Remaining: ${countAfter}`,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 500,
      text: `ERROR: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
