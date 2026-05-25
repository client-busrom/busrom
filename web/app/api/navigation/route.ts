import { NextRequest, NextResponse } from 'next/server';
import { NavigationMenuType, type NavItem } from '@/types/navigation';
import { resolveInternalLink } from '@/lib/utils';

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Payload CMS 导航菜单数据类型
 */
interface CardImageConfig {
  mode: 'manual' | 'application';
  manualImage?: number | null;
  applicationId?: string | number | null;
}

interface PayloadNavMenu {
  id: string;
  name: string; // 已经是单语言（通过 locale 参数获取）
  type: string;
  icon?: string;
  link?: string;
  inquiryLink?: string;
  order: number;
  parent?: { id: string } | string | null;
  gridSpan?: number;
  cardImage?: CardImageConfig;
  cardImageResolved?: {
    url: string;
    filename: string;
    sizes?: any;
  } | null;
}

function normalizeResolvedImage(media: any, strategy?: string): { url: string; filename: string; sizes?: any } | null {
  if (!media) return null;
  if (typeof media === 'object' && media.url) {
    const transformedSizes: any = {};
    if (media.sizes) {
      Object.entries(media.sizes).forEach(([key, value]: [string, any]) => {
        if (value?.url) {
          transformedSizes[key] = {
            ...value,
            url: convertToCDNUrl(value.url, strategy),
          };
        }
      });
    }
    return {
      url: convertToCDNUrl(media.url, strategy),
      filename: media.filename || 'image',
      sizes: transformedSizes,
    };
  }
  return null;
}

import { convertToCDNUrl } from '@/lib/cdn-url';

/**
 * Resolve card image from cardImage config (manual or application mode)
 */
async function resolveCardImage(
  config: CardImageConfig | undefined,
  locale: string,
  strategy?: string
): Promise<{ url: string; filename: string; sizes?: any } | null> {
  if (!config) return null;

  // Manual mode: fetch the selected media directly
  if (config.mode === 'manual' && config.manualImage) {
    try {
      const response = await fetch(
        `${CMS_URL}/api/media/${config.manualImage}?locale=${locale}`,
        {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 300 },
        }
      );
      if (!response.ok) return null;
      const media = await response.json();
      if (!media) return null;

      const transformedSizes: any = {};
      if (media.sizes) {
        Object.entries(media.sizes).forEach(([key, value]: [string, any]) => {
          if (value?.url) {
            transformedSizes[key] = {
              ...value,
              url: convertToCDNUrl(value.url, strategy),
            };
          }
        });
      }

      return {
        url: convertToCDNUrl(media.url, strategy),
        filename: media.filename,
        sizes: transformedSizes,
      };
    } catch (error) {
      console.error('[Navigation API] Error fetching manual image:', error);
      return null;
    }
  }

  // Application mode: randomly pick one image from the application's scene gallery
  if (config.mode === 'application' && config.applicationId) {
    try {
      const response = await fetch(
        `${CMS_URL}/api/applications/${config.applicationId}?locale=${locale}&depth=1`,
        {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 300 },
        }
      );
      if (!response.ok) return null;
      const app = await response.json();
      if (!app || !app.sceneGallery || app.sceneGallery.length === 0) return null;

      const allImages = (app.sceneGallery as any[]).flatMap((scene: any) => scene.images || []);
      if (allImages.length === 0) return null;

      // De-duplicate
      const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id || img, img])).values());

      // Randomly pick one
      const randomIndex = Math.floor(Math.random() * uniqueImages.length);
      const media = uniqueImages[randomIndex];
      if (!media) return null;

      const transformedSizes: any = {};
      if (media.sizes) {
        Object.entries(media.sizes).forEach(([key, value]: [string, any]) => {
          if (value?.url) {
            transformedSizes[key] = {
              ...value,
              url: convertToCDNUrl(value.url, strategy),
            };
          }
        });
      }

      return {
        url: convertToCDNUrl(media.url, strategy),
        filename: media.filename,
        sizes: transformedSizes,
      };
    } catch (error) {
      console.error('[Navigation API] Error fetching application image:', error);
      return null;
    }
  }

  return null;
}

/**
 * 转换函数：将 Payload CMS 数据转换为前端期望的格式
 */
async function transformNavigationItem(
  item: PayloadNavMenu,
  locale: string,
  allMenus: PayloadNavMenu[],
  strategy?: string,
  parentType?: string
): Promise<NavItem> {
  const typeMap: Record<string, NavigationMenuType> = {
    'standard': NavigationMenuType.STANDARD,
    'product_cards': NavigationMenuType.PRODUCT_CARDS,
    'submenu': NavigationMenuType.SUBMENU,
  };

  const result: NavItem = {
    id: item.id,
    label: item.name || 'Untitled',
    url: resolveInternalLink(item.link),
    type: typeMap[item.type] || NavigationMenuType.STANDARD,
    icon: item.icon,
    openInNewTab: false,
    order: item.order,
  };

  if (result.url === '/service/one-stop') {
    result.url = '/service/one-stop-shop';
  }

  if (item.inquiryLink) {
    result.inquiryLink = item.inquiryLink;
  }

  if (item.gridSpan && item.gridSpan > 1) {
    result.gridSpan = item.gridSpan;
  }

  const shouldFetchImage = item.type === 'product_cards' || parentType === 'product_cards';

  if (shouldFetchImage) {
    // Prefer pre-resolved image from CMS afterRead hook
    const resolved = normalizeResolvedImage(item.cardImageResolved, strategy);
    if (resolved) {
      result.image = resolved;
    } else if (item.cardImage) {
      const image = await resolveCardImage(item.cardImage, locale, strategy);
      if (image) {
        result.image = image;
      }
    }
  }

  const children = allMenus.filter(menu => {
    if (!menu.parent) return false;
    const parentId = typeof menu.parent === 'string' ? menu.parent : menu.parent.id;
    return parentId === item.id;
  });

  if (children.length > 0) {
    result.childMenus = await Promise.all(
      children
        .sort((a, b) => a.order - b.order)
        .map(child => transformNavigationItem(child, locale, allMenus, strategy, item.type))
    );
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';
    const strategy = request.cookies.get('cdn_strategy')?.value;

    console.log('[Navigation API] Fetching navigation from Payload CMS for locale:', locale, 'strategy:', strategy);

    // 从 Payload CMS 获取所有可见的导航菜单
    // 导航数据变化不频繁，缓存 5 分钟
    const response = await fetch(
      `${CMS_URL}/api/navigation-menus?where[visible][equals]=true&limit=1000&locale=${locale}&depth=2`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // 缓存 5 分钟
      }
    );

    if (!response.ok) {
      console.error('[Navigation API] Payload CMS error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch navigation data from CMS' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const allMenus = data.docs as PayloadNavMenu[];

    console.log('[Navigation API] Payload CMS response received, total menus:', allMenus.length);

    // 过滤出顶级菜单（parent 为 null 或不存在）
    const topLevelMenus = allMenus.filter(menu => !menu.parent);

    console.log('[Navigation API] Top level menus:', topLevelMenus.length);

    // 转换数据：组装父子关系并转换格式
    const transformedData = await Promise.all(
      topLevelMenus
        .sort((a, b) => a.order - b.order)
        .map(item => transformNavigationItem(item, locale, allMenus, strategy))
    );

    console.log('[Navigation API] Transformed data:', transformedData.length);

    // 设置响应缓存头：浏览器缓存 5 分钟，CDN 缓存 1 小时
    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('[Navigation API] Error:', error);
    console.error('[Navigation API] Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
