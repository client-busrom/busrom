import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n.config';

/**
 * URL 路由策略:
 * - 英文(默认): busromhouse.com/  (无前缀)
 * - 其他语言: busromhouse.com/zh, busromhouse.com/fr 等
 */

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  const searchParams = request.nextUrl.searchParams;
  
  // 核心判断：是否是本地开发环境
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

  /**
   * 统一 URL 清理工具
   * 确保生产环境下始终返回标准 HTTPS URL，绝不暴露内部端口
   */
  const getUrl = (targetPath: string) => {
    // 基础对象使用 request.url 构建，确保 searchParams 等信息保留
    const url = new URL(targetPath, 'https://www.busromhouse.com');
    
    // 保留原始请求的查询参数
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    if (isLocalhost) {
      // 本地环境下，可以保留端口，但路径要对
      const localUrl = request.nextUrl.clone();
      localUrl.pathname = targetPath;
      return localUrl;
    }

    // 生产环境：强制标准域名、HTTPS、无端口
    url.protocol = 'https:';
    url.port = '';
    
    // 始终强制使用 www.busromhouse.com
    url.hostname = 'www.busromhouse.com';
    
    return url;
  };

  // 0. 内部重写标识检查 (防止死循环)
  const isInternalRewrite = searchParams.get('x-intl-rewrite') === 'true';

  // 1. Legacy URL Redirects (SEO)
  if (pathname.includes('/service/one-stop-shop')) {
    const newPath = pathname.replace('/service/one-stop-shop', '/service/one-stop-solution');
    return NextResponse.redirect(getUrl(newPath), 301);
  }

  // 2. Canonical Domain Redirect: non-www to www or plain IP/Host to canonical domain
  if (!isLocalhost && (host === 'busromhouse.com' || host?.includes(':3001') || !host?.includes('busromhouse.com'))) {
    // 如果是通过非标准 Host 进入的，强制重定向到标准域名
    return NextResponse.redirect(getUrl(pathname), 301);
  }

  // 3. CDN Strategy
  const cdnOverride = searchParams.get('cdn');
  const country = request.headers.get('cloudfront-viewer-country');
  const existingStrategy = request.cookies.get('cdn_strategy')?.value;

  let newStrategy: string | null = null;
  if (cdnOverride === 'china' || cdnOverride === 'global' || cdnOverride === 'local') {
    newStrategy = cdnOverride;
  } else if (country && !isLocalhost) {
    newStrategy = country === 'CN' ? 'china' : 'global';
  }

  const setStrategyCookie = (res: NextResponse) => {
    if (newStrategy && existingStrategy !== newStrategy) {
      res.cookies.set('cdn_strategy', newStrategy, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    }
    res.headers.set('x-cdn-strategy-debug', newStrategy || existingStrategy || 'none');
    res.headers.set('x-viewer-country', country || 'unknown');
    // 重要：标记请求已被中间件处理过
    res.headers.set('x-middleware-processed', 'true');
    res.headers.set('Vary', 'Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, CloudFront-Viewer-Country, Cookie');
    return res;
  };

  // 4. API skip
  if (pathname.startsWith('/api/')) {
    return setStrategyCookie(NextResponse.next());
  }

  // 5. Default Locale Redirect: /en -> /
  // 关键修复：如果是内部重写 pass，绝对不能重定向，否则会死循环
  if (!isInternalRewrite && (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`))) {
    const newPath = pathname.replace(new RegExp(`^/${defaultLocale}/?`), '/') || '/';
    return setStrategyCookie(NextResponse.redirect(getUrl(newPath), 301));
  }

  // 6. Locale Prefix Check
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // 7. Internal Rewrite for default locale (en)
  if (!hasLocale) {
    const rewriteUrl = getUrl(`/${defaultLocale}${pathname}`);
    // 添加内部重写标记，防止 Step 5 拦截并重定向
    rewriteUrl.searchParams.set('x-intl-rewrite', 'true');
    
    // 强制清除端口，防止重写时暴露内部端口
    if (!isLocalhost) {
      rewriteUrl.port = '';
    }
    
    return setStrategyCookie(NextResponse.rewrite(rewriteUrl));
  }

  return setStrategyCookie(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap|sitemaps\\.xml|robots\\.txt|feed|.*\\..*).*)'],
};