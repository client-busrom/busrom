/**
 * IndexNow API Service
 * 
 * Supports notifying Bing, Yandex, and other search engines that support IndexNow.
 * Docs: https://www.indexnow.org/documentation
 */

export async function notifyIndexNow(urls: string | string[]) {
  const key = process.env.INDEXNOW_KEY
  const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'www.busromhouse.com'
  
  if (!key) {
    console.log('⚠️ [IndexNow] INDEXNOW_KEY not found. Skipping IndexNow notification.')
    return { success: false, message: 'Key not configured' }
  }

  const urlList = Array.isArray(urls) ? urls : [urls]
  
  try {
    // We notify Bing as the primary endpoint (they share it with other IndexNow partners)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList,
      }),
    })

    if (response.ok) {
      console.log(`🚀 [IndexNow] Successfully notified of ${urlList.length} URLs`)
      return { success: true, message: 'IndexNow notification sent' }
    } else {
      const error = await response.text()
      throw new Error(error)
    }
  } catch (error: any) {
    console.error('❌ [IndexNow] Failed:', error.message)
    return { success: false, message: error.message }
  }
}
