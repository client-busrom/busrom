import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, nonDefaultLocales } from '@/i18n.config';

/**
 * URL 路由策略:
 * - 英文(默认): busromhouse.com/  (无前缀)
 * - 其他语言: busromhouse.com/zh, busromhouse.com/fr 等
 *
 * SEO 301 重定向:
 * - /en -> /
 * - /en/about -> /about
 */

function getPreferredLocale(request: NextRequest): string {
  // 1. 优先从 user-preferences cookie 中获取语言
  const preferencesCookie = request.cookies.get('user-preferences')?.value;
  if (preferencesCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(preferencesCookie));
      if (parsed.language && locales.includes(parsed.language)) {
        return parsed.language;
      }
    } catch (e) { /* ignore malformed cookie */ }
  }

  // 2. 如果没有 cookie，从 Accept-Language header 获取
  const languages = request.headers.get('accept-language')?.split(',')?.map(lang => lang.split(';')[0]);
  if (languages) {
    for (const lang of languages) {
      if (locales.includes(lang as any)) return lang;
      const baseLang = lang.split('-')[0];
      if (locales.includes(baseLang as any)) return baseLang;
    }
  }

  // 3. 回退到默认语言
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  const searchParams = request.nextUrl.searchParams;

  // Legacy URL Redirects (SEO Cleanup)
  if (pathname.includes('/service/one-stop-shop')) {
    const newPath = pathname.replace('/service/one-stop-shop', '/service/one-stop-solution');
    const url = new URL(newPath, request.url);
    return NextResponse.redirect(url, 301);
  }

  // 1. SEO Canonical Domain Redirect: non-www to www
  // Only apply to production domains, skip localhost
  if (host === 'busromhouse.com') {
    const url = new URL(request.url);
    url.host = 'www.busromhouse.com';
    return NextResponse.redirect(url, 301);
  }

  // 2. Pre-determine CDN Strategy
  const cdnOverride = searchParams.get('cdn');
  const country = request.headers.get('cloudfront-viewer-country');
  const existingStrategy = request.cookies.get('cdn_strategy')?.value;
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

  let newStrategy: string | null = null;
  
  // Priority: Explicit parameter > Geo Location (non-local) > Status Quo
  if (cdnOverride === 'china' || cdnOverride === 'global' || cdnOverride === 'local') {
    newStrategy = cdnOverride;
  } else if (country && !isLocalhost) {
    newStrategy = country === 'CN' ? 'china' : 'global';
  }

  const setStrategyCookie = (res: NextResponse) => {
    if (newStrategy && existingStrategy !== newStrategy) {
      res.cookies.set('cdn_strategy', newStrategy, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
    }
    res.headers.set('x-cdn-strategy-debug', newStrategy || existingStrategy || 'none');
    res.headers.set('x-viewer-country', country || 'unknown');
    res.headers.set('x-is-localhost', String(isLocalhost));
    res.headers.set('Vary', 'Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, CloudFront-Viewer-Country, Cookie');
    return res;
  };

  // 3. Special handling for API: skip locale logic
  if (pathname.startsWith('/api/')) {
    return setStrategyCookie(NextResponse.next());
  }

  // 4. Default Locale Redirect (SEO Protection): /en -> /
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const newPath = pathname.replace(new RegExp(`^/${defaultLocale}/?`), '/') || '/';
    const url = new URL(newPath, request.url);
    url.search = request.nextUrl.search;
    return setStrategyCookie(NextResponse.redirect(url, 301));
  }

  // 5. Check for non-default locale prefix
  const hasNonDefaultLocale = nonDefaultLocales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // 6. Rewrite for default locale if no prefix
  if (!hasNonDefaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return setStrategyCookie(NextResponse.rewrite(url));
  }

  return setStrategyCookie(NextResponse.next());
}

export const config = {
  // 包含 api 路径，以便在 API 调用中也能实时检测并更新 cdn_strategy Cookie
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap|sitemaps\\.xml|robots\\.txt|feed|.*\\..*).*)'],
};