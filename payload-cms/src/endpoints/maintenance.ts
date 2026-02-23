import { PayloadHandler } from 'payload'
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront'

/**
 * POST /api/maintenance/invalidate-cdn
 *
 * Trigger an AWS CloudFront invalidation for the entire site (/*)
 */
export const invalidateCdnHandler: PayloadHandler = async (req) => {
  const { user, payload } = req

  // Check permissions
  if (!user || !user.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json?.() as { distributionId?: string }
    const { distributionId } = body || {}

    if (!distributionId) {
      return Response.json({ error: 'Distribution ID is required' }, { status: 400 })
    }

    // Initialize CloudFront client
    // Credentials should be in environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
    const client = new CloudFrontClient({
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    })

    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `payload-cms-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ['/*'],
        },
      },
    })

    const response = await client.send(command)

    payload.logger.info(`✅ CloudFront invalidation created: ${response.Invalidation?.Id}`)

    return Response.json({ 
      message: 'Invalidation request submitted successfully!',
      invalidationId: response.Invalidation?.Id 
    })
  } catch (error: any) {
    payload.logger.error(`❌ CloudFront invalidation failed: ${error.message}`)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/maintenance/revalidate-frontend
 *
 * Trigger an on-demand revalidation on the Next.js frontend
 */
export const revalidateFrontendHandler: PayloadHandler = async (req) => {
  const { user, payload } = req

  // Check permissions
  if (!user || user.isAdmin !== true) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json?.() as { frontendUrl?: string, revalidateSecret?: string }
    const { frontendUrl, revalidateSecret } = body || {}

    if (!frontendUrl || !revalidateSecret) {
      return Response.json({ error: 'Frontend URL and Secret are required' }, { status: 400 })
    }

    // Call the frontend revalidation endpoint
    // We assume the frontend has an endpoint at /api/revalidate
    const url = new URL(`${frontendUrl.replace(/\/$/, '')}/api/revalidate`)
    url.searchParams.append('secret', revalidateSecret)
    url.searchParams.append('all', 'true') // Flag to revalidate everything if possible

    payload.logger.info(`🔄 Triggering frontend revalidation: ${url.origin}${url.pathname}`)

    const response = await fetch(url.toString(), {
      method: 'GET', // or POST depending on how the frontend is implemented
    })

    if (response.ok) {
      const data = await response.json()
      return Response.json({ message: 'Frontend revalidation triggered successfully!', data })
    } else {
      const errorText = await response.text()
      payload.logger.error(`❌ Frontend revalidation failed: ${response.status} ${errorText}`)
      return Response.json({ error: `Frontend returned ${response.status}: ${errorText}` }, { status: 500 })
    }
  } catch (error: any) {
    payload.logger.error(`❌ Frontend revalidation request failed: ${error.message}`)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
