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
      try {
        const response = await fetch(finalInput, init);

        // Retry on 502/503/504
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          console.warn(`[cmsFetch] Attempt ${attempt} failed with status ${response.status} for ${urlString}. Retrying...`);
          if (attempt < maxRetries) {
            await delay(attempt * 500);
            continue;
          }
        }

        return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`[cmsFetch] Attempt ${attempt} encountered network error: ${error.message || error} for ${urlString}. Retrying...`);
        if (attempt < maxRetries) {
          await delay(attempt * 500);
          continue;
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    // Exhausted retries but have a response (e.g. 504), return a fresh request's response to callers
    return fetch(finalInput, init);
  });
}
