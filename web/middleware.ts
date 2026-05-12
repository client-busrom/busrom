import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n.config';

/**
 * Ultra-Safe Minimalist Middleware
 * Reverting all complex redirects to restore stability.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip everything for static files and health checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    request.headers.get('user-agent')?.includes('ELB-HealthChecker')
  ) {
    return NextResponse.next();
  }

  // 2. Simple Locale Prefixing logic
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    // Only rewrite to default locale, using a relative path to avoid Next.js 15 URL leakage
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap|robots.txt|.*\\..*).*)'],
};