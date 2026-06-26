import { describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { verifyPayloadToken, checkPermission, isAllowedRole } from '../auth'

const TEST_SECRET = process.env.PAYLOAD_SECRET as string

async function signToken(payload: Record<string, any>, expiresIn?: string) {
  const secret = new TextEncoder().encode(TEST_SECRET)
  const signer = new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()

  if (expiresIn) {
    signer.setExpirationTime(expiresIn)
  }

  return signer.sign(secret)
}

describe('verifyPayloadToken', () => {
  it('returns user info for a valid token', async () => {
    const token = await signToken({
      id: 'user-1',
      email: 'admin@busrom.com',
      name: 'Admin User',
      roles: ['admin'],
      isAdmin: true,
      collection: 'users',
    })

    const user = await verifyPayloadToken(token)

    expect(user).toEqual({
      id: 'user-1',
      email: 'admin@busrom.com',
      name: 'Admin User',
      roles: ['admin'],
      isAdmin: true,
      collection: 'users',
    })
  })

  it('returns null for an invalid token', async () => {
    const user = await verifyPayloadToken('not.a.valid.token')
    expect(user).toBeNull()
  })

  it('returns null for a token signed with a different secret', async () => {
    const wrongSecret = new TextEncoder().encode('wrong-secret')
    const token = await new SignJWT({ id: 'user-2', email: 'user@busrom.com' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(wrongSecret)

    const user = await verifyPayloadToken(token)
    expect(user).toBeNull()
  })

  it('returns null for an expired token', async () => {
    const token = await signToken(
      {
        id: 'user-3',
        email: 'user@busrom.com',
        roles: ['editor'],
      },
      '-1h'
    )

    const user = await verifyPayloadToken(token)
    expect(user).toBeNull()
  })
})

describe('checkPermission / isAllowedRole', () => {
  it('allows admin users regardless of roles', () => {
    const user = {
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      roles: ['viewer'],
      isAdmin: true,
      collection: 'users',
    }

    expect(checkPermission(user)).toBe(true)
    expect(isAllowedRole(user)).toBe(true)
  })

  it('allows users with allowed roles', () => {
    const admin = { ...baseUser(), roles: ['admin'] }
    const editor = { ...baseUser(), roles: ['editor'] }
    const analytics = { ...baseUser(), roles: ['analytics'] }

    expect(checkPermission(admin)).toBe(true)
    expect(checkPermission(editor)).toBe(true)
    expect(checkPermission(analytics)).toBe(true)
    expect(isAllowedRole(admin)).toBe(true)
  })

  it('rejects users without allowed roles', () => {
    const viewer = { ...baseUser(), roles: ['viewer'] }
    const noRoles = { ...baseUser(), roles: [] }

    expect(checkPermission(viewer)).toBe(false)
    expect(checkPermission(noRoles)).toBe(false)
    expect(isAllowedRole(viewer)).toBe(false)
    expect(isAllowedRole(noRoles)).toBe(false)
  })

  it('rejects non-admin users with partial disallowed roles', () => {
    const mixed = { ...baseUser(), roles: ['viewer', 'admin'] }
    expect(checkPermission(mixed)).toBe(true)

    const onlyBad = { ...baseUser(), roles: ['viewer', 'guest'] }
    expect(checkPermission(onlyBad)).toBe(false)
  })
})

function baseUser() {
  return {
    id: 'u',
    email: 'u@b.com',
    name: 'U',
    roles: [] as string[],
    isAdmin: false,
    collection: 'users',
  }
}
