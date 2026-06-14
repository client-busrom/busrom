import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const url = searchParams.get('url')

  // Validate the secret
  const DRAFT_SECRET = process.env.PAYLOAD_PUBLIC_DRAFT_SECRET || 'busrom-draft-secret-2026'
  if (secret !== DRAFT_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  if (!url) {
    return new Response('Missing URL', { status: 400 })
  }

  // Enable Draft Mode by setting the cookie
  const draft = await draftMode()
  draft.enable()

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.url as that might lead to open redirect vulnerabilities
  // We just trust the payload CMS provided URL here
  redirect(url)
}
