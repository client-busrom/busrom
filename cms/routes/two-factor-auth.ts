/**
 * Two-Factor Authentication API Routes
 *
 * Provides endpoints for:
 * - Generating 2FA setup (secret + QR code)
 * - Enabling 2FA (verify token + save secret)
 * - Disabling 2FA
 * - Generating backup codes
 */

import type { Request, Response } from 'express'
import {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorToken,
  generateBackupCodes,
  hashBackupCode,
} from '../lib/two-factor-auth'

/**
 * POST /api/2fa/setup
 *
 * Generate a new 2FA secret and QR code for the current user
 */
export async function setupTwoFactorHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context

    // Check if user is authenticated
    if (!context.session?.itemId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Get user email
    const user = await context.query.User.findOne({
      where: { id: context.session.itemId },
      query: 'email twoFactorEnabled',
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        error: '2FA is already enabled. Disable it first to set up a new secret.',
      })
    }

    // Generate new secret
    const { secret, otpauthUrl } = generateTwoFactorSecret(user.email)

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(otpauthUrl)

    // Return secret and QR code (don't save to database yet)
    // User must verify the token before we enable 2FA
    res.json({
      success: true,
      secret,
      qrCode: qrCodeDataUrl,
      message: 'Scan the QR code with your authenticator app and enter the 6-digit code to enable 2FA.',
    })
  } catch (error: any) {
    console.error('2FA setup error:', error)
    res.status(500).json({ error: error.message || 'Failed to set up 2FA' })
  }
}

/**
 * POST /api/2fa/enable
 *
 * Enable 2FA by verifying the token and saving the secret
 *
 * Body: { secret: string, token: string }
 */
export async function enableTwoFactorHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context
    const { secret, token } = req.body

    // Validate input
    if (!secret || !token) {
      return res.status(400).json({ error: 'Secret and token are required' })
    }

    // Check if user is authenticated
    if (!context.session?.itemId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Verify the token
    const isValid = verifyTwoFactorToken(token, secret)

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid token. Please check your authenticator app and try again.',
      })
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10)
    const hashedBackupCodes = backupCodes.map(hashBackupCode)

    // Save secret and enable 2FA
    await context.sudo().query.User.updateOne({
      where: { id: context.session.itemId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: hashedBackupCodes,
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
      console.error('Failed to log 2FA enable activity:', error)
    }

    res.json({
      success: true,
      backupCodes, // Return unhashed codes for user to save
      message: '2FA has been enabled successfully. Save these backup codes in a safe place.',
    })
  } catch (error: any) {
    console.error('2FA enable error:', error)
    res.status(500).json({ error: error.message || 'Failed to enable 2FA' })
  }
}

/**
 * POST /api/2fa/disable
 *
 * Disable 2FA (requires current password or backup code)
 *
 * Body: { password?: string, backupCode?: string }
 */
export async function disableTwoFactorHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context
    const { password, backupCode } = req.body

    // Check if user is authenticated
    if (!context.session?.itemId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Get user
    const user = await context.sudo().query.User.findOne({
      where: { id: context.session.itemId },
      query: 'id email twoFactorEnabled backupCodes',
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' })
    }

    // Verify password or backup code
    let isAuthorized = false

    if (password) {
      // Verify password using Keystone's authentication
      try {
        const { authenticateUserWithPassword } = context.query.User
        const result = await authenticateUserWithPassword({
          email: user.email,
          password,
        })

        if (result && result.__typename === 'UserAuthenticationWithPasswordSuccess') {
          isAuthorized = true
        }
      } catch (error) {
        console.error('Password verification error:', error)
        isAuthorized = false
      }
    } else if (backupCode && user.backupCodes) {
      // Verify backup code
      const { verifyBackupCode } = await import('../lib/two-factor-auth')
      const hashedCodes = user.backupCodes as string[]

      isAuthorized = hashedCodes.some((hashedCode: string) =>
        verifyBackupCode(backupCode, hashedCode)
      )

      if (isAuthorized) {
        // Remove used backup code
        const updatedCodes = hashedCodes.filter(
          (hashedCode: string) => !verifyBackupCode(backupCode, hashedCode)
        )
        await context.sudo().query.User.updateOne({
          where: { id: context.session.itemId },
          data: { backupCodes: updatedCodes },
        })
      }
    }

    if (!isAuthorized) {
      return res.status(401).json({ error: 'Invalid password or backup code' })
    }

    // Disable 2FA
    await context.sudo().query.User.updateOne({
      where: { id: context.session.itemId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: '',
        backupCodes: [],
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
      console.error('Failed to log 2FA disable activity:', error)
    }

    res.json({
      success: true,
      message: '2FA has been disabled successfully.',
    })
  } catch (error: any) {
    console.error('2FA disable error:', error)
    res.status(500).json({ error: error.message || 'Failed to disable 2FA' })
  }
}

/**
 * POST /api/2fa/regenerate-backup-codes
 *
 * Generate new backup codes (requires current password or 2FA token)
 *
 * Body: { password?: string, token?: string }
 */
export async function regenerateBackupCodesHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context
    const { password, token } = req.body

    // Check if user is authenticated
    if (!context.session?.itemId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Get user
    const user = await context.sudo().query.User.findOne({
      where: { id: context.session.itemId },
      query: 'email twoFactorEnabled twoFactorSecret',
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' })
    }

    // Verify authorization
    let isAuthorized = false

    if (token && user.twoFactorSecret) {
      isAuthorized = verifyTwoFactorToken(token, user.twoFactorSecret)
    } else if (password) {
      // Verify password using Keystone's authentication
      try {
        const { authenticateUserWithPassword } = context.query.User
        const result = await authenticateUserWithPassword({
          email: user.email,
          password,
        })

        if (result && result.__typename === 'UserAuthenticationWithPasswordSuccess') {
          isAuthorized = true
        }
      } catch (error) {
        console.error('Password verification error:', error)
        isAuthorized = false
      }
    }

    if (!isAuthorized) {
      return res.status(401).json({ error: 'Invalid password or token' })
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10)
    const hashedBackupCodes = backupCodes.map(hashBackupCode)

    // Save new backup codes
    await context.sudo().query.User.updateOne({
      where: { id: context.session.itemId },
      data: { backupCodes: hashedBackupCodes },
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
      console.error('Failed to log backup codes regeneration:', error)
    }

    res.json({
      success: true,
      backupCodes, // Return unhashed codes for user to save
      message: 'New backup codes generated. Save them in a safe place.',
    })
  } catch (error: any) {
    console.error('Backup codes regeneration error:', error)
    res.status(500).json({ error: error.message || 'Failed to regenerate backup codes' })
  }
}
