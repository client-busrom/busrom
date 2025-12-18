import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })

    // 使用 locale: 'all' 一次性获取所有语言数据
    const doc = await payload.findGlobal({
      slug: slug as any,
      locale: 'all',
      depth: 0,
    })

    if (!doc) {
      return NextResponse.json(
        { error: 'Global not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(doc)
  } catch (error) {
    console.error('[globals all-locales] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}
