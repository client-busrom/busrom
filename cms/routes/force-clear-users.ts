/**
 * EMERGENCY: Force clear all users
 * This endpoint will IMMEDIATELY delete all users without confirmation
 * Use with extreme caution!
 */

import type { Request, Response } from 'express';

export async function forceClearUsersHandler(req: Request, res: Response) {
  // Security: Only allow in non-production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).send('Not available in production');
  }

  try {
    const context = (req as any).context;

    console.log('🚨 FORCE CLEARING ALL USERS...');

    // Count before
    const countBefore = await context.sudo().db.User.count();
    console.log(`Found ${countBefore} user(s)`);

    // Delete ALL users
    const result = await context.sudo().db.User.deleteMany({});
    console.log(`Deleted ${result.count} user(s)`);

    // Count after
    const countAfter = await context.sudo().db.User.count();
    console.log(`Remaining: ${countAfter} user(s)`);

    res.send(`SUCCESS: Deleted ${result.count} users. Remaining: ${countAfter}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  }
}
