/**
 * Two-Factor Authentication API Endpoints
 *
 * Provides endpoints for:
 * - Generating 2FA setup (secret + QR code)
 * - Enabling 2FA (verify token + save secret)
 * - Disabling 2FA
 * - Verifying 2FA token (for login)
 * - Regenerating backup codes
 */

import type { PayloadHandler } from 'payload'
import {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorToken,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from '../lib/two-factor-auth'

/**
 * POST /api/2fa/setup
 *
 * Generate a new 2FA secret and QR code for the current user
 */
export const setup2FAHandler: PayloadHandler = async (req) => {
  try {
    const { user, payload } = req

    // Check if user is authenticated
    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user with 2FA status
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    if (!fullUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if 2FA is already enabled
    if (fullUser.twoFactorEnabled) {
      return Response.json({
        error: '2FA is already enabled. Disable it first to set up a new secret.',
      }, { status: 400 })
    }

    // Generate new secret
    const { secret, otpauthUrl } = generateTwoFactorSecret(fullUser.email)

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl)

    return Response.json({
      success: true,
      secret,
      qrCode,
      message: 'Scan the QR code with your authenticator app and enter the 6-digit code to enable 2FA.',
    })
  } catch (error: unknown) {
    console.error('2FA setup error:', error)
    const message = error instanceof Error ? error.message : 'Failed to set up 2FA'
    return Response.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/2fa/enable
 *
 * Enable 2FA by verifying the token and saving the secret
 *
 * Body: { secret: string, token: string }
 */
export const enable2FAHandler: PayloadHandler = async (req) => {
  try {
    const { user, payload } = req
    const body = await req.json?.() || {}
    const { secret, token } = body

    // Validate input
    if (!secret || !token) {
      return Response.json({ error: 'Secret and token are required' }, { status: 400 })
    }

    // Check if user is authenticated
    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify the token
    const isValid = verifyTwoFactorToken(token, secret)

    if (!isValid) {
      return Response.json({
        error: 'Invalid token. Please check your authenticator app and try again.',
      }, { status: 400 })
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10)
    const hashedBackupCodes = backupCodes.map(hashBackupCode)

    // Save secret and enable 2FA
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: hashedBackupCodes,
      },
    })

    return Response.json({
      success: true,
      backupCodes, // Return unhashed codes for user to save
      message: '2FA has been enabled successfully. Save these backup codes in a safe place.',
    })
  } catch (error: unknown) {
    console.error('2FA enable error:', error)
    const message = error instanceof Error ? error.message : 'Failed to enable 2FA'
    return Response.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/2fa/disable
 *
 * Disable 2FA (requires current 2FA token or backup code)
 *
 * Body: { token?: string, backupCode?: string }
 */
export const disable2FAHandler: PayloadHandler = async (req) => {
  try {
    const { user, payload } = req
    const body = await req.json?.() || {}
    const { token, backupCode } = body

    // Check if user is authenticated
    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user with 2FA data (need to bypass access control to get secret)
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
    })

    if (!fullUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (!fullUser.twoFactorEnabled) {
      return Response.json({ error: '2FA is not enabled' }, { status: 400 })
    }

    // Verify token or backup code
    let isAuthorized = false

    if (token && fullUser.twoFactorSecret) {
      isAuthorized = verifyTwoFactorToken(token, fullUser.twoFactorSecret)
    } else if (backupCode && fullUser.backupCodes) {
      const hashedCodes = fullUser.backupCodes as string[]
      isAuthorized = hashedCodes.some((hashedCode: string) =>
        verifyBackupCode(backupCode, hashedCode)
      )
    }

    if (!isAuthorized) {
      return Response.json({ error: 'Invalid token or backup code' }, { status: 401 })
    }

    // Disable 2FA
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: '',
        backupCodes: [],
      },
    })

    return Response.json({
      success: true,
      message: '2FA has been disabled successfully.',
    })
  } catch (error: unknown) {
    console.error('2FA disable error:', error)
    const message = error instanceof Error ? error.message : 'Failed to disable 2FA'
    return Response.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/2fa/verify
 *
 * Verify a 2FA token (used during login)
 *
 * Body: { userId: string, token: string } or { userId: string, backupCode: string }
 */
export const verify2FAHandler: PayloadHandler = async (req) => {
  try {
    const { payload } = req
    const body = await req.json?.() || {}
    const { userId, token, backupCode } = body

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!token && !backupCode) {
      return Response.json({ error: 'Token or backup code is required' }, { status: 400 })
    }

    // Get user with 2FA data
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
      overrideAccess: true,
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return Response.json({ error: '2FA is not enabled for this user' }, { status: 400 })
    }

    let isValid = false
    let usedBackupCode = false

    if (token) {
      isValid = verifyTwoFactorToken(token, user.twoFactorSecret)
    } else if (backupCode && user.backupCodes) {
      const hashedCodes = user.backupCodes as string[]
      const matchIndex = hashedCodes.findIndex((hashedCode: string) =>
        verifyBackupCode(backupCode, hashedCode)
      )

      if (matchIndex !== -1) {
        isValid = true
        usedBackupCode = true

        // Remove used backup code
        const updatedCodes = [...hashedCodes]
        updatedCodes.splice(matchIndex, 1)
        await payload.update({
          collection: 'users',
          id: userId,
          data: { backupCodes: updatedCodes },
        })
      }
    }

    if (!isValid) {
      return Response.json({ error: 'Invalid token or backup code' }, { status: 401 })
    }

    return Response.json({
      success: true,
      usedBackupCode,
      remainingBackupCodes: usedBackupCode
        ? ((user.backupCodes as string[])?.length || 0) - 1
        : undefined,
    })
  } catch (error: unknown) {
    console.error('2FA verify error:', error)
    const message = error instanceof Error ? error.message : 'Failed to verify 2FA'
    return Response.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/2fa/regenerate-backup-codes
 *
 * Generate new backup codes (requires current 2FA token)
 *
 * Body: { token: string }
 */
export const regenerateBackupCodesHandler: PayloadHandler = async (req) => {
  try {
    const { user, payload } = req
    const body = await req.json?.() || {}
    const { token } = body

    // Check if user is authenticated
    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!token) {
      return Response.json({ error: 'Token is required' }, { status: 400 })
    }

    // Get user with 2FA data
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
    })

    if (!fullUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (!fullUser.twoFactorEnabled || !fullUser.twoFactorSecret) {
      return Response.json({ error: '2FA is not enabled' }, { status: 400 })
    }

    // Verify token
    const isValid = verifyTwoFactorToken(token, fullUser.twoFactorSecret)

    if (!isValid) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10)
    const hashedBackupCodes = backupCodes.map(hashBackupCode)

    // Save new backup codes
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { backupCodes: hashedBackupCodes },
    })

    return Response.json({
      success: true,
      backupCodes,
      message: 'New backup codes generated. Save them in a safe place.',
    })
  } catch (error: unknown) {
    console.error('Backup codes regeneration error:', error)
    const message = error instanceof Error ? error.message : 'Failed to regenerate backup codes'
    return Response.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/2fa/status
 *
 * Get the current user's 2FA status
 */
export const get2FAStatusHandler: PayloadHandler = async (req) => {
  try {
    const { user, payload } = req

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
    })

    if (!fullUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({
      enabled: fullUser.twoFactorEnabled || false,
      backupCodesCount: (fullUser.backupCodes as string[])?.length || 0,
    })
  } catch (error: unknown) {
    console.error('2FA status error:', error)
    const message = error instanceof Error ? error.message : 'Failed to get 2FA status'
    return Response.json({ error: message }, { status: 500 })
  }
}
