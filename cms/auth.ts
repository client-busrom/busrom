/**
 * Keystone Authentication Configuration
 *
 * This file configures the authentication system for Keystone CMS.
 * It sets up session management and user authentication.
 */

import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'

/**
 * Configure authentication with the User model
 *
 * - listKey: The list to use for authentication (User model)
 * - identityField: The field used for login (email)
 * - sessionData: What data to include in the session
 * - secretField: The password field
 * - initFirstItem: Enable first user creation on initial setup
 */
const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'id name email isAdmin roles { id name code }',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    itemData: {
      isAdmin: true,
      status: 'ACTIVE',
      twoFactorEnabled: false,
      twoFactorSecret: '',
      backupCodes: [],
    },
  },
})

/**
 * Session Secret Validation
 *
 * Ensures SESSION_SECRET is set in environment variables.
 * This is critical for securing user sessions.
 */
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  throw new Error(
    'SESSION_SECRET environment variable must be set in production. ' +
    'Generate one with: openssl rand -base64 32'
  )
}

/**
 * Session Configuration
 *
 * - maxAge: Session duration in seconds (30 days)
 * - secret: Secret key for signing session tokens
 */
const sessionConfig = statelessSessions({
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secret: sessionSecret || 'default-dev-secret-change-in-production',
})

export { withAuth, sessionConfig as session }
