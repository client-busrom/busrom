/**
 * 2FA Login Verification Route
 *
 * This endpoint is called after successful password authentication
 * to verify the 2FA token or backup code.
 */

import type { Request, Response } from 'express'
import { verifyTwoFactorToken, verifyBackupCode } from '../lib/two-factor-auth'

/**
 * POST /api/verify-2fa
 *
 * Verify 2FA token or backup code during login
 *
 * Body: { email: string, token?: string, backupCode?: string }
 */
export async function verify2FALoginHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context
    const { email, token, backupCode } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    if (!token && !backupCode) {
      return res.status(400).json({ error: 'Token or backup code is required' })
    }

    // Get user by email
    const users = await context.sudo().query.User.findMany({
      where: { email: { equals: email } },
      query: 'id twoFactorEnabled twoFactorSecret backupCodes',
    })

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = users[0]

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled for this user' })
    }

    let isValid = false

    // Verify token
    if (token && user.twoFactorSecret) {
      isValid = verifyTwoFactorToken(token, user.twoFactorSecret)
    }
    // Or verify backup code
    else if (backupCode && user.backupCodes) {
      const hashedCodes = user.backupCodes as string[]
      isValid = hashedCodes.some((hashedCode: string) =>
        verifyBackupCode(backupCode, hashedCode)
      )

      // If backup code is valid, remove it from the list
      if (isValid) {
        const updatedCodes = hashedCodes.filter(
          (hashedCode: string) => !verifyBackupCode(backupCode, hashedCode)
        )
        await context.sudo().query.User.updateOne({
          where: { id: user.id },
          data: { backupCodes: updatedCodes },
        })
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid 2FA code' })
    }

    // 2FA verification successful
    res.json({
      success: true,
      message: '2FA verification successful',
    })
  } catch (error: any) {
    console.error('2FA verification error:', error)
    res.status(500).json({ error: error.message || 'Failed to verify 2FA' })
  }
}

/**
 * POST /api/check-2fa-required
 *
 * Check if a user has 2FA enabled
 *
 * Body: { email: string }
 */
export async function check2FARequiredHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Get user by email
    const users = await context.sudo().query.User.findMany({
      where: { email: { equals: email } },
      query: 'twoFactorEnabled',
    })

    if (users.length === 0) {
      // Don't reveal if user exists or not for security
      return res.json({ required: false })
    }

    const user = users[0]

    res.json({
      required: user.twoFactorEnabled === true,
    })
  } catch (error: any) {
    console.error('Check 2FA required error:', error)
    res.status(500).json({ error: error.message || 'Failed to check 2FA status' })
  }
}
