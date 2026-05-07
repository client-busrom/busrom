import { google } from 'googleapis'

/**
 * Google Indexing API Service
 * 
 * This service handles real-time indexing requests to Google.
 * Requirements:
 * 1. Google Cloud Service Account with "Indexing API" enabled.
 * 2. Service Account JSON key stored in GOOGLE_INDEXING_CREDENTIALS env var.
 * 3. Service Account email added as "Owner" in Google Search Console.
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
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    })

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
    // Handle specific errors like 403 (permission denied) or 429 (quota exceeded)
    return { success: false, message: error.message }
  }
}
