/**
 * Save Form Fields Translations Endpoint
 *
 * POST /api/form-configs-save-fields
 * Body: { id: string | number, updates: { [locale: string]: fields[] } }
 *
 * Why this exists:
 * The FormFieldsTranslationCenter previously issued one client-side PATCH per
 * locale (23+ sequential HTTP round trips), which made "Save All" feel like an
 * infinite save. Those requests MUST stay sequential: Payload's localized
 * update does a read-modify-write on the same document row, and concurrent
 * PATCHes on different locales race and overwrite each other.
 *
 * This endpoint moves the sequential loop server-side: one HTTP round trip,
 * locales are still updated strictly one-by-one (no concurrency), so the race
 * condition is avoided while latency drops to a single request.
 */

import type { PayloadHandler } from 'payload'

interface SaveFieldsRequest {
  id?: string | number
  updates?: Record<string, unknown[]>
}

export const saveFormFieldsTranslationsHandler: PayloadHandler = async (req) => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = (await req.json?.()) as SaveFieldsRequest | undefined
    const id = body?.id
    const updates = body?.updates

    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 })
    }
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return Response.json({ error: 'updates is required' }, { status: 400 })
    }

    const saved: string[] = []
    const failed: Record<string, string> = {}

    // IMPORTANT: sequential on purpose. Do NOT parallelize — concurrent
    // localized updates of the same document race inside Payload.
    for (const [locale, fields] of Object.entries(updates)) {
      if (!Array.isArray(fields)) {
        failed[locale] = 'fields must be an array'
        continue
      }

      try {
        await payload.update({
          collection: 'form-configs',
          id,
          locale: locale as any,
          data: { fields: fields as any },
          overrideAccess: false,
          req,
        })
        saved.push(locale)
      } catch (error) {
        payload.logger.error({ err: error, locale }, `[saveFormFieldsTranslations] Failed for locale ${locale}`)
        failed[locale] = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return Response.json({
      success: Object.keys(failed).length === 0,
      saved,
      failed: Object.keys(failed).length > 0 ? failed : undefined,
    })
  } catch (error) {
    payload.logger.error({ err: error }, '[saveFormFieldsTranslations] Handler error')
    return Response.json(
      { error: error instanceof Error ? error.message : 'Save failed' },
      { status: 500 },
    )
  }
}
