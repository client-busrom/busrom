import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, nonDefaultLocales } from '@/i18n.config';

/**
 * URL 路由策略:
 * - 英文(默认): busromhouse.com/  (无前缀)
 * - 其他语言: busromhouse.com/zh, busromhouse.com/fr 等
 */

function getPreferredLocale(request: NextRequest): string {
  const preferencesCookie = request.cookies.get('user-preferences')?.value;
  if (preferencesCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(preferencesCookie));
      if (parsed.language && locales.includes(parsed.language)) {
        return parsed.language;
      }
    } catch (e) { /* ignore */ }
  }

  const languages = request.headers.get('accept-language')?.split(',')?.map(lang => lang.split(';')[0]);
  if (languages) {
    for (const lang of languages) {
      if (locales.includes(lang as any)) return lang;
      const baseLang = lang.split('-')[0];
      if (locales.includes(baseLang as any)) return baseLang;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  const searchParams = request.nextUrl.searchParams;
  
  // 核心判断：是否是本地开发环境
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

  /**
   * 统一 URL 清理工具
   * @param targetPath 目标路径
   * @param isRedirect 是否是重定向（true 则抹除端口，false 则保留内部路由所需端口）
   */
  const getUrl = (targetPath: string, isRedirect: boolean) => {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    
    // 如果是线上环境重定向，强制抹除端口并统一协议
    if (!isLocalhost && isRedirect) {
      url.port = '';
      url.protocol = 'https';
    }
    
    // 特殊处理：如果是 www 重定向
    if (!isLocalhost && host === 'busromhouse.com') {
      url.hostname = 'www.busromhouse.com';
    }
    
    return url;
  };

  // 1. Legacy URL Redirects (SEO)
  if (pathname.includes('/service/one-stop-shop')) {
    const newPath = pathname.replace('/service/one-stop-shop', '/service/one-stop-solution');
    return NextResponse.redirect(getUrl(newPath, true), 301);
  }

  // 2. Canonical Domain Redirect: non-www to www
  if (host === 'busromhouse.com') {
    return NextResponse.redirect(getUrl(pathname, true), 301);
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
    res.headers.set('Vary', 'Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, CloudFront-Viewer-Country, Cookie');
    return res;
  };

  // 4. API skip
  if (pathname.startsWith('/api/')) {
    return setStrategyCookie(NextResponse.next());
  }

  // 5. Default Locale Redirect: /en -> /
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const newPath = pathname.replace(new RegExp(`^/${defaultLocale}/?`), '/') || '/';
    return setStrategyCookie(NextResponse.redirect(getUrl(newPath, true), 301));
  }

  // 6. Locale Prefix Check
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // 7. Internal Rewrite for default locale (Keep ports if localhost)
  if (!hasLocale) {
    const rewriteUrl = getUrl(`/${defaultLocale}${pathname}`, false);
    return setStrategyCookie(NextResponse.rewrite(rewriteUrl));
  }

  return setStrategyCookie(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap|sitemaps\\.xml|robots\\.txt|feed|.*\\..*).*)'],
};