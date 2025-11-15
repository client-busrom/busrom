/**
 * Two-Factor Authentication Utilities
 *
 * Provides TOTP-based two-factor authentication using the Speakeasy library.
 * Compatible with Google Authenticator, Authy, and other TOTP apps.
 */

import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

/**
 * Generate a new 2FA secret for a user
 *
 * @param userEmail - User's email address (used in the QR code label)
 * @returns Object containing the secret and otpauth URL
 */
export function generateTwoFactorSecret(userEmail: string): {
  secret: string
  otpauthUrl: string
} {
  const secret = speakeasy.generateSecret({
    name: `Busrom CMS (${userEmail})`,
    issuer: 'Busrom CMS',
    length: 32,
  })

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
  }
}

/**
 * Generate a QR code data URL from an otpauth URL
 *
 * @param otpauthUrl - The otpauth:// URL from the secret
 * @returns Promise resolving to a data URL (base64 encoded PNG)
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return dataUrl
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Verify a TOTP token against a secret
 *
 * @param token - The 6-digit token from the authenticator app
 * @param secret - The user's 2FA secret (base32 encoded)
 * @returns True if the token is valid
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    // Remove any spaces or dashes from the token
    const cleanToken = token.replace(/[\s-]/g, '')

    // Verify with a window of ±1 time step (30 seconds each)
    // This allows for slight time drift between server and client
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: cleanToken,
      window: 1, // Allow 1 time step before and after
    })

    return isValid
  } catch (error) {
    console.error('Failed to verify 2FA token:', error)
    return false
  }
}

/**
 * Generate backup recovery codes
 *
 * These codes can be used if the user loses access to their authenticator app.
 * Each code can only be used once.
 *
 * @param count - Number of backup codes to generate (default: 10)
 * @returns Array of backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []

  for (let i = 0; i < count; i++) {
    // Generate a random 8-character alphanumeric code
    const code = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()
    codes.push(code)
  }

  return codes
}

/**
 * Hash a backup code for secure storage
 *
 * @param code - The backup code to hash
 * @returns Hashed code (using simple crypto for now)
 */
export function hashBackupCode(code: string): string {
  // In production, use a proper hashing algorithm like bcrypt or argon2
  // For now, we'll use a simple base64 encoding
  // TODO: Implement proper hashing
  return Buffer.from(code).toString('base64')
}

/**
 * Verify a backup code against a hashed code
 *
 * @param code - The code provided by the user
 * @param hashedCode - The stored hashed code
 * @returns True if the code matches
 */
export function verifyBackupCode(code: string, hashedCode: string): boolean {
  const hashedInput = hashBackupCode(code)
  return hashedInput === hashedCode
}
