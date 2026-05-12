import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n.config';

/**
 * Busrom Production Middleware
 * Responsibilities:
 * 1. Health check bypass
 * 2. Canonical domain & HTTPS enforcement (www.busromhouse.com)
 * 3. Port leakage prevention (:3001)
 * 4. Locale-based routing (en as default root)
 */

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';

  // 1. Skip middleware for static assets, internal paths, and health checks
  const isHealthCheck = userAgent.includes('ELB-HealthChecker') || pathname === '/api/health';
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    isHealthCheck
  ) {
    return NextResponse.next();
  }

  // Helper to generate canonical URL without port leakage
  const getCanonicalUrl = (targetPath: string) => {
    const url = new URL(targetPath, 'https://www.busromhouse.com');
    // Ensure no port is present in production
    url.port = '';
    // Preserve search params
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
    return url.toString();
  };

  // 2. Enforce Canonical Domain (www.busromhouse.com) and HTTPS
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const currentHostOnly = host.split(':')[0];
  
  if (!isLocalhost && (currentHostOnly !== 'www.busromhouse.com' || protocol !== 'https')) {
    return NextResponse.redirect(getCanonicalUrl(pathname), 301);
  }

  // 3. Handle Default Locale Redirect (/en -> /)
  // We only redirect if it's NOT an internal rewrite
  const isInternalRewrite = request.nextUrl.searchParams.get('x-intl-rewrite') === 'true';
  
  if (!isInternalRewrite && (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`))) {
    const newPath = pathname.replace(new RegExp(`^/${defaultLocale}(/|$)`), '/') || '/';
    return NextResponse.redirect(getCanonicalUrl(newPath), 301);
  }

  // 4. Handle Locale Prefixes and Internal Rewrites
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    // Internal rewrite for default locale (en)
    const rewriteUrl = new URL(`/${defaultLocale}${pathname}`, 'https://www.busromhouse.com');
    rewriteUrl.port = '';
    // Add internal marker to avoid redirect loops
    rewriteUrl.searchParams.set('x-intl-rewrite', 'true');
    // Preserve other search params
    request.nextUrl.searchParams.forEach((v, k) => {
      if (k !== 'x-intl-rewrite') rewriteUrl.searchParams.set(k, v);
    });

    return NextResponse.rewrite(rewriteUrl);
  }

  // 5. Set Strategy Cookie for CDN/Parser logic
  const response = NextResponse.next();
  const country = request.headers.get('cloudfront-viewer-country');
  const existingStrategy = request.cookies.get('cdn_strategy')?.value;
  
  let strategy = existingStrategy;
  if (country === 'CN') {
    strategy = 'china';
  } else if (!existingStrategy) {
    strategy = 'global';
  }

  if (strategy && strategy !== existingStrategy) {
    response.cookies.set('cdn_strategy', strategy, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  // Catch all paths except static files and api
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemaps|robots.txt|feed|.*\\..*).*)'],
};