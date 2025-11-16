/**
 * Temporary API endpoint to clear all users from staging database
 * WARNING: This should only be used in development/staging environments
 * and should be removed after use!
 */

import type { Request } from 'express';

export default async function clearStagingUsers(req: Request, context: any) {
  const { prisma } = context;

  try {
    // Security check - only allow in non-production environment
    if (process.env.NODE_ENV === 'production') {
      return {
        status: 403,
        json: {
          success: false,
          message: 'This endpoint is not available in production',
        },
      };
    }

    console.log('🔍 Fetching all users...');

    // Get all users before deletion for logging
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        status: true,
      },
    });

    console.log(`Found ${users.length} user(s) to delete`);

    if (users.length === 0) {
      return {
        status: 200,
        json: {
          success: true,
          message: 'No users to delete. Database is already clean.',
          deletedCount: 0,
        },
      };
    }

    // Delete all users
    console.log('🗑️  Deleting all users...');
    const deleteResult = await prisma.user.deleteMany({});

    console.log(`✅ Deleted ${deleteResult.count} user(s)`);

    // Verify deletion
    const remainingUsers = await prisma.user.count();

    return {
      status: 200,
      json: {
        success: true,
        message: `Successfully deleted ${deleteResult.count} user(s)`,
        deletedCount: deleteResult.count,
        remainingCount: remainingUsers,
        deletedUsers: users.map(u => ({
          email: u.email,
          name: u.name,
          isAdmin: u.isAdmin,
        })),
      },
    };
  } catch (error) {
    console.error('❌ Error clearing users:', error);

    return {
      status: 500,
      json: {
        success: false,
        message: 'Failed to clear users',
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
