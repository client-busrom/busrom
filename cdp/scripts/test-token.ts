import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.PAYLOAD_SECRET || 'CHANGE_ME_IN_PRODUCTION')

async function main() {
  const token = await new SignJWT({
    id: 1,
    email: 'admin@busrom.com',
    isAdmin: true,
    roles: ['admin'],
    collection: 'users',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret)

  console.log(token)
}

main()
