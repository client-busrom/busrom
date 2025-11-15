/**
 * Update Password API Route
 *
 * Provides endpoint for authenticated users to update their password
 */

import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'

/**
 * POST /api/update-password
 *
 * Update the current user's password
 *
 * Body: { currentPassword: string, newPassword: string }
 */
export async function updatePasswordHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context
    const { currentPassword, newPassword } = req.body

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      })
    }

    // Check if user is authenticated
    if (!context.session?.itemId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      })
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      })
    }

    // Get user email
    const user = await context.sudo().query.User.findOne({
      where: { id: context.session.itemId },
      query: 'id email',
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Verify current password using Keystone's authentication
    try {
      const { authenticateUserWithPassword } = context.query.User
      const result = await authenticateUserWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (!result || result.__typename !== 'UserAuthenticationWithPasswordSuccess') {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        })
      }
    } catch (error) {
      console.error('Password verification error:', error)
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    // Update password using Keystone's updateOne
    // The password field type will automatically hash the new password
    await context.sudo().query.User.updateOne({
      where: { id: context.session.itemId },
      data: {
        password: newPassword,
      },
    })

    // Log activity
    try {
      const { logActivity } = await import('../lib/activity-logger')
      await logActivity(
        context,
        'update',
        'User',
        { id: context.session.itemId },
        req
      )
    } catch (error) {
      console.error('Failed to log password update activity:', error)
    }

    res.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error: any) {
    console.error('Password update error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update password',
    })
  }
}
