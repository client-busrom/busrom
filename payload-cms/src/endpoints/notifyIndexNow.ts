import type { PayloadRequest, Endpoint } from 'payload'
import { notifyIndexNow, getIndexNowDocUrls } from '../lib/index-now'

/**
 * Factory for creating a collection endpoint that manually submits a published
 * document to IndexNow (Bing/Yandex/Seznam/Naver).
 *
 * Usage in a CollectionConfig:
 *   endpoints: [
 *     ...otherEndpoints,
 *     {
 *       path: '/:id/notify-indexnow',
 *       method: 'post',
 *       handler: createNotifyIndexNowEndpoint('product-series'),
 *     },
 *   ],
 */
export function createNotifyIndexNowEndpoint(
  collectionSlug: string,
): Endpoint['handler'] {
  return async (req: PayloadRequest) => {
    const { payload, user, routeParams } = req
    if (!user) return new Response('Unauthorized', { status: 401 })

    const id = routeParams?.id
    if (!id) return new Response('Missing ID', { status: 400 })

    try {
      const doc = (await payload.findByID({
        collection: collectionSlug as any,
        id: id as string,
        depth: 0,
      })) as any

      if (!doc || doc.status !== 'published') {
        return new Response(JSON.stringify({ error: 'Only published documents can be indexed.' }), { status: 400 })
      }

      const urls = getIndexNowDocUrls(doc, collectionSlug)
      const res = await notifyIndexNow(urls)

      try {
        await payload.create({
          collection: 'indexing-logs',
          req,
          overrideAccess: true,
          data: {
            targetUrl: urls.length > 1 ? `${urls.length} URLs (e.g. ${urls[0]})` : urls[0],
            engine: 'indexnow',
            action: 'update',
            status: res?.success
              ? 'success'
              : res?.message?.includes('Key') || res?.message?.includes('Credentials')
                ? 'failed_keys'
                : 'failed_network',
            triggerUser: user.id,
            rawResponse: res,
          },
        })
      } catch (e) {
        console.error('Failed to write IndexNow log:', e)
      }

      return new Response(
        JSON.stringify({ success: res?.success, result: res, urls }),
        { status: res?.success ? 200 : 500 },
      )
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 })
    }
  }
}
