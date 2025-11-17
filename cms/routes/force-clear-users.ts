/**
 * EMERGENCY: Force clear all users
 * This endpoint will IMMEDIATELY delete all users without confirmation
 * Use with extreme caution!
 */

import type { Request, Response } from 'express';

export async function forceClearUsersHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context;

    console.log('🚨 FORCE CLEARING ALL USERS...');

    // Get all users
    const allUsers = await context.sudo().query.User.findMany({
      query: 'id'
    });

    console.log(`Found ${allUsers.length} user(s)`);

    if (allUsers.length === 0) {
      return res.send('No users to delete');
    }

    // Delete each user
    let deleted = 0;
    for (const user of allUsers) {
      await context.sudo().query.User.deleteOne({
        where: { id: user.id }
      });
      deleted++;
    }

    console.log(`Deleted ${deleted} user(s)`);

    // Verify
    const remaining = await context.sudo().query.User.findMany({
      query: 'id'
    });

    res.send(`SUCCESS: Deleted ${deleted} users. Remaining: ${remaining.length}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  }
}
