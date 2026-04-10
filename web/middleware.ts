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

  // 1. 预先判定 CDN 策略
  const urlParams = request.nextUrl.searchParams;
  const cdnOverride = urlParams.get('cdn');
  const country = request.headers.get('cloudfront-viewer-country');
  const existingStrategy = request.cookies.get('cdn_strategy')?.value;
  const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1');

  let newStrategy: string | null = null;
  
  // 优先级: 显式参数 > 地理位置 (非本地) > 保持现状
  if (cdnOverride === 'china' || cdnOverride === 'global' || cdnOverride === 'local') {
    newStrategy = cdnOverride;
  } else if (country && !isLocalhost) {
    // 只有在非本地环境下才根据国家自动设置 (避免在本地开发时干扰 Nginx 反代)
    newStrategy = country === 'CN' ? 'china' : 'global';
  }

  const setStrategyCookie = (res: NextResponse) => {
    if (newStrategy && existingStrategy !== newStrategy) {
      res.cookies.set('cdn_strategy', newStrategy, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 天
        sameSite: 'lax',
      });
    }
    // 增加调试头和缓存隔离头
    res.headers.set('x-cdn-strategy-debug', newStrategy || existingStrategy || 'none');
    res.headers.set('x-viewer-country', country || 'unknown');
    res.headers.set('x-is-localhost', String(isLocalhost));
    res.headers.set('Vary', 'Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, CloudFront-Viewer-Country, Cookie');
    return res;
  };

  // 2. 对 API 路径特殊处理：跳过语言重定向/重写，直接进行 CDN 策略判定
  if (pathname.startsWith('/api/')) {
    const res = NextResponse.next();
    return setStrategyCookie(res);
  }

  // 3. 处理 /en 和 /en/* 的 301 重定向 (SEO 保护)
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const newPath = pathname.replace(new RegExp(`^/${defaultLocale}/?`), '/') || '/';
    const url = new URL(newPath, request.url);
    url.search = request.nextUrl.search;
    const res = NextResponse.redirect(url, 301);
    return setStrategyCookie(res);
  }

  // 3. 检查路径是否已经有非默认语言前缀 (如 /zh, /fr)
  const hasNonDefaultLocale = nonDefaultLocales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // 4. 如果路径没有语言前缀，视为默认语言(英文)，执行 rewrite
  if (!hasNonDefaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    const res = NextResponse.rewrite(url);
    return setStrategyCookie(res);
  }

  // 5. 正常通过路径
  const res = NextResponse.next();
  return setStrategyCookie(res);
}

export const config = {
  // 包含 api 路径，以便在 API 调用中也能实时检测并更新 cdn_strategy Cookie
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap|sitemaps\\.xml|robots\\.txt|feed|.*\\..*).*)'],
};