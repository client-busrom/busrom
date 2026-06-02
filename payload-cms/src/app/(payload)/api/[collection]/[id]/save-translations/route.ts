import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { collection, id } = await params

    const body = await req.json()
    const { locales, sourceLocale } = body
    console.log(`📡 [save-translations] Incoming request for ${collection}/${id}. Locales count: ${Object.keys(locales || {}).length}`)
    console.log(`📡 [save-translations] Body keys: ${Object.keys(body).join(', ')}`)

    if (!locales || typeof locales !== 'object') {
      return NextResponse.json({ error: 'Invalid locales data' }, { status: 400 })
    }

    // 2. 初始化请求上下文并获取身份
    const i18nReq: any = req
    i18nReq.payload = payload
    i18nReq.context = i18nReq.context || {}

    // 尝试获取当前登录用户
    const { user } = await payload.auth(i18nReq)
    i18nReq.user = user

    // 先获取当前文档的状态，防止被重置为草稿
    const currentDoc = await payload.findByID({
      collection: collection as any,
      id,
      depth: 0,
      showHiddenFields: true,
      req: i18nReq,
    })

    const results = []
    const systemFields = ['id', 'createdAt', 'updatedAt', 'status', 'publishedAt', 'User', 'Operation', 'author', 'adminLabel', 'slug']

    // 使用串行保存，确保数据库稳定性
    for (const [localeCode, data] of Object.entries(locales)) {
      try {
        // [Bugfix] Clear the transactionID from the request object for each iteration.
        // In Payload 3.x, `payload.update` mutates `req` by attaching a `transactionID` when it starts a transaction.
        // It commits the transaction at the end of the update, but leaves the ID on the `req` object.
        // On subsequent loop iterations, Payload sees the ID, thinks it's an active transaction, and tries to use it.
        // Postgres then aborts it because the transaction was already committed, causing the "rollback" or "empty translations" bug.
        if (i18nReq.transactionID) {
          delete i18nReq.transactionID
        }

        console.log(`[save-translations] ⏳ Saving locale=${localeCode}... Data keys: ${Object.keys(data as any).join(', ')}`)
        
        // 清理数据
        const cleanedData: any = {}
        
        // 覆盖翻译过来的数据 (只更新传入的字段，不合并 currentDoc，避免引发 hasMany 关联字段重复插入的 Bug)
        Object.entries(data as any).forEach(([key, value]) => {
          if (systemFields.includes(key)) return
          if (key.startsWith('_') && key !== '_id') return
          cleanedData[key] = value
        })

        // 3. 强制带上状态和发布时间
        cleanedData.status = currentDoc.status
        cleanedData.publishedAt = currentDoc.publishedAt

        // 在请求上下文中注入标记，确保审计插件能够识别并跳过
        i18nReq.context.isTranslationSave = true
        i18nReq.context.isSyncing = true

        console.log(`📡 [save-translations] ⏳ Updating locale=${localeCode} for ${collection}/${id}. User: ${i18nReq.user?.email || 'Admin'}`)

        // [Bugfix] 如果是源语言或默认语言(en)，必须开启 Hooks 进行保存，否则 Payload 底层会因为缺少 Hook 处理
        // 而导致默认语言的数据没有正确写入 locale 关联表，导致其凭空变为空值。
        // 其他目标语言则保持 disableHooks: true 追求极速。
        const shouldUseHooks = localeCode === 'en' || localeCode === sourceLocale;

        const updatedDoc = await payload.update({
          collection: collection as any,
          id,
          data: cleanedData,
          locale: localeCode as any,
          disableHooks: !shouldUseHooks,
          req: i18nReq,
        } as any)

        // [SQL FORCE] 物理层确保状态不丢失 (针对 Blog 集合)
        if (collection === 'blogs' && currentDoc.status === 'published') {
          const db = (payload.db as any).drizzle
          if (db) {
            const { sql } = await import('drizzle-orm')
            await db.execute(sql`UPDATE "blogs" SET "status" = 'published' WHERE "id" = ${id}`)
          }
        }

        results.push({ locale: localeCode, success: true, id: (updatedDoc as any).id })
      } catch (err: any) {
        console.error(`[save-translations] ❌ Error in ${localeCode}:`, err.message)
        results.push({ locale: localeCode, success: false, error: err.message })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('[save-translations] Global Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
