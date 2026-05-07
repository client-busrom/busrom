import { google } from 'googleapis'

/**
 * Google Indexing API Service
 * 
 * This service handles real-time indexing requests to Google.
 */

export async function notifyGoogleOfUpdate(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  const credentialsJson = process.env.GOOGLE_INDEXING_CREDENTIALS
  
  if (!credentialsJson) {
    console.log('⚠️ [Google Indexing] Credentials not found. Skipping real-time indexing.')
    return { success: false, message: 'Credentials not configured' }
  }

  try {
    const credentials = JSON.parse(credentialsJson)
    
    // 1. Initialize Auth
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ['https://www.googleapis.com/auth/indexing']
    )

    // 2. Initialize Indexing client
    const indexing = google.indexing({
      version: 'v3',
      auth,
    })

    console.log(`🚀 [Google Indexing] Notifying Google of ${type}: ${url}`)

    // 3. Send Notification
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    })

    return { 
      success: true, 
      message: 'Notification sent successfully',
      data: response.data 
    }
  } catch (error: any) {
    console.error('❌ [Google Indexing] Failed:', error.message)
    return { success: false, message: error.message }
  }
}
