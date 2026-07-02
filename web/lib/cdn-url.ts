/**
 * CDN URL Helper
 *
 * Converts MinIO signed URLs to CDN URLs for better performance and caching.
 *
 * In development:
 * - MinIO: http://localhost:9000/busrom-media/filename.jpg?signature=...
 * - CDN:   http://localhost:8080/busrom-media/filename.jpg
 *
 * In production:
 * - S3:    https://s3.amazonaws.com/bucket/filename.jpg?signature=...
 * - CDN:   https://cdn.example.com/bucket/filename.jpg
 */

// Support both client-side (NEXT_PUBLIC_) and server-side (CDN_DOMAIN) env vars
const DEFAULT_CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || process.env.CDN_DOMAIN || 'http://localhost:8080'
const CHINA_DOMAIN = 'https://cdn.busromhouse.com'
const GLOBAL_DOMAIN = 'https://d2kqew3hn5wphn.cloudfront.net'
const MINIO_ENDPOINT = 'http://localhost:9000'
const S3_PATTERN = /https?:\/\/[^\/]+\.amazonaws\.com/

/**
 * 获取当前应当使用的 CDN 域名
 * 优先级: 1. 显式传入的 strategy > 2. 浏览器 Cookie > 3. 开发环境默认 > 4. 环境变量
 */
export function getCDNDomain(strategy?: string): string {
  // 1. 显式指定的策略 (如来自 API 传参或 URL 参数强制覆盖)
  if (strategy === 'global') return GLOBAL_DOMAIN;
  if (strategy === 'china') return CHINA_DOMAIN;
  if (strategy === 'local') return DEFAULT_CDN_DOMAIN;

  // 2. 客户端脚本检测 Cookie (仅在浏览器执行)
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/cdn_strategy=([^;]+)/);
    if (match) {
      if (match[1] === 'global') return GLOBAL_DOMAIN;
      if (match[1] === 'china') return CHINA_DOMAIN;
      if (match[1] === 'local') return DEFAULT_CDN_DOMAIN;
    }
  }

  // 3. 开发环境特殊处理：
  // 如果在开发环境下且没有明确指令，始终优先使用本地反代 (localhost:8080)
  if (process.env.NODE_ENV === 'development') {
    return DEFAULT_CDN_DOMAIN;
  }

  // 4. 生产环境默认逻辑 (视项目需求，这里默认走中国区)
  //    如果 env var 没配置，回退到 CHINA_DOMAIN（而非 localhost:8080）
  return DEFAULT_CDN_DOMAIN !== 'http://localhost:8080'
    ? DEFAULT_CDN_DOMAIN
    : CHINA_DOMAIN;
}

/**
 * Convert a MinIO or S3 signed URL to a CDN URL
 *
 * @param url - The original signed URL from MinIO or S3
 * @param strategy - Optional forced strategy ('china' | 'global')
 * @returns The CDN URL without signature parameters
 */
export function convertToCDNUrl(url: string, strategy?: string): string {
  if (!url) return url

  // Skip CDN conversion for local relative paths (e.g. /BusromFooterBg_original.webp)
  if (url.startsWith('/')) return url

  try {
    const domain = getCDNDomain(strategy);
    // encodeURI handles spaces and special chars in URLs that would break new URL()
    const urlObj = new URL(encodeURI(url))

    // 1. 开发环境 MinIO: 转换 http://localhost:9000 -> 选定的 CDN 域名
    if (url.startsWith(MINIO_ENDPOINT)) {
      const path = urlObj.pathname
      return `${domain}${path}`
    }

    // 2. 生产环境 S3: 转换 https://s3.amazonaws.com -> 选定的 CDN 域名
    if (S3_PATTERN.test(url)) {
      const path = urlObj.pathname
      return `${domain}${path}`
    }

    // 3. 已有域名归一化: 拦截 CloudFront, Custom Domain, 以及本地默认 CDN 域名 (8080)
    // 这样当策略切换时，即使图片已经是 8080，也会被切换到 cdn.busromhouse.com
    if (
      url.includes('d2kqew3hn5wphn.cloudfront.net') || 
      url.includes('cdn.busromhouse.com') ||
      url.includes('localhost:8080') ||
      (DEFAULT_CDN_DOMAIN !== CHINA_DOMAIN && DEFAULT_CDN_DOMAIN !== GLOBAL_DOMAIN && url.includes(DEFAULT_CDN_DOMAIN))
    ) {
      const path = urlObj.pathname
      return `${domain}${path}`
    }

    // 如果都不匹配，返回原样
    return url
  } catch (error) {
    console.error('Error converting URL to CDN:', error)
    return url
  }
}
