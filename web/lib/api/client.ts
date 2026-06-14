import { fetchLimiter } from '../semaphore';

export const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A resilient wrapper around fetch for CMS API requests.
 * - Automatically resolves relative paths using the default CMS base URL.
 * - Wraps the request within the global fetchLimiter concurrency queue.
 * - Automatically retries on 502/503/504 errors and transient network dropouts (up to 3 times).
 */
export async function cmsFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  let urlString = '';
  let finalInput = input;

  if (typeof input === 'string') {
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      const normalizedPath = input.startsWith('/') ? input : `/${input}`;
      urlString = `${CMS_URL}${normalizedPath}`;
      finalInput = urlString;
    } else {
      urlString = input;
    }
  } else if (input instanceof URL) {
    urlString = input.toString();
  } else if (input instanceof Request) {
    urlString = input.url;
  }

  const maxRetries = 3;
  let lastError: any = null;

  return fetchLimiter.run(async () => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      try {
        const response = await fetch(finalInput, {
          ...init,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        // Retry on 502/503/504
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          console.warn(`[cmsFetch] Attempt ${attempt} failed with status ${response.status} for ${urlString}. Retrying...`);
          if (attempt < maxRetries) {
            // Exponential backoff: 3s, 6s
            await delay(attempt * 3000);
            continue;
          }
        }

        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);
        lastError = error;
        const isTimeout = error.name === 'AbortError';
        console.warn(`[cmsFetch] Attempt ${attempt} ${isTimeout ? 'timed out (15s)' : 'encountered network error'}: ${error.message || error} for ${urlString}. Retrying...`);
        if (attempt < maxRetries) {
          // Exponential backoff: 3s, 6s
          await delay(attempt * 3000);
          continue;
        }
      }
    }

    console.error(`[cmsFetch] All ${maxRetries} attempts failed for ${urlString}. Returning synthetic 504 Response.`);
    
    // Return synthetic 504 Gateway Timeout instead of throwing to prevent crashing the build
    return new Response(
      JSON.stringify({ error: 'Gateway Timeout / Bad Gateway after retries', url: urlString }),
      {
        status: 504,
        statusText: 'Gateway Timeout',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  });
}
