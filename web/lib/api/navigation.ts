import { cmsFetch, CMS_URL } from "./client";
import { NavigationMenuType, type NavItem } from '@/types/navigation';
import { resolveInternalLink } from '../utils';
import { convertToCDNUrl } from '../cdn-url';

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
  name: string;
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

function normalizeResolvedImage(media: any): { url: string; filename: string; sizes?: any } | null {
  if (!media) return null;
  if (typeof media === 'object' && media.url) {
    const transformedSizes: any = {};
    if (media.sizes) {
      Object.entries(media.sizes).forEach(([key, value]: [string, any]) => {
        if (value?.url) {
          transformedSizes[key] = {
            ...(value as any),
            url: convertToCDNUrl((value as any).url),
          };
        }
      });
    }
    return {
      url: convertToCDNUrl(media.url),
      filename: media.filename || 'image',
      sizes: transformedSizes,
    };
  }
  return null;
}

/**
 * Resolve card image from cardImage config (manual or application mode)
 */
async function resolveCardImage(
  config: CardImageConfig | undefined,
  locale: string
): Promise<{ url: string; filename: string; sizes?: any } | null> {
  if (!config) return null;

  // Manual mode: fetch the selected media directly
  if (config.mode === 'manual' && config.manualImage) {
    try {
      const response = await cmsFetch(
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
              ...(value as any),
              url: convertToCDNUrl((value as any).url)
            };
          }
        });
      }

      return {
        url: convertToCDNUrl(media.url),
        filename: media.filename,
        sizes: transformedSizes,
      };
    } catch (error) {
      console.error('[getNavigation] Error fetching manual image:', error);
      return null;
    }
  }

  // Application mode: randomly pick one image from the application's scene gallery
  if (config.mode === 'application' && config.applicationId) {
    try {
      const response = await cmsFetch(
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
              ...(value as any),
              url: convertToCDNUrl((value as any).url)
            };
          }
        });
      }

      return {
        url: convertToCDNUrl(media.url),
        filename: media.filename,
        sizes: transformedSizes,
      };
    } catch (error) {
      console.error('[getNavigation] Error fetching application image:', error);
      return null;
    }
  }

  return null;
}

/**
 * 修复旧版 URL 并确保标准化格式
 */
function fixProductUrl(url: string | null | undefined): string {
  return resolveInternalLink(url);
}

/**
 * 转换函数：将 Payload CMS 数据转换为前端期望的格式
 */
async function transformNavigationItem(
  item: PayloadNavMenu,
  locale: string,
  allMenus: PayloadNavMenu[],
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
    url: fixProductUrl(item.link),
    type: typeMap[item.type] || NavigationMenuType.STANDARD,
    icon: item.icon,
    openInNewTab: false,
    order: item.order,
  };

  if ((item as any).linkLabel) {
    result.linkLabel = (item as any).linkLabel;
  }
  
  if ((item as any).inquiryLabel) {
    result.inquiryLabel = (item as any).inquiryLabel;
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
    const resolved = normalizeResolvedImage(item.cardImageResolved);
    if (resolved) {
      result.image = resolved;
    } else if (item.cardImage) {
      const image = await resolveCardImage(item.cardImage, locale);
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
          .map(child => transformNavigationItem(child, locale, allMenus, item.type))
    );
  }

  return result;
}

/**
 * 服务端获取导航数据
 * 直接调用 CMS API，用于 SSR 预取
 */
let navPromiseCache: Record<string, Promise<NavItem[]> | undefined> = {};
let navCacheTime: Record<string, number> = {};
const CACHE_TTL = 5 * 60 * 1000;

/**
 * 服务端获取导航数据
 * 直接调用 CMS API，用于 SSR 预取
 */
export async function getNavigation(locale: string): Promise<NavItem[]> {
  const now = Date.now();
  if (navPromiseCache[locale] && now - (navCacheTime[locale] || 0) < CACHE_TTL) {
    return navPromiseCache[locale]!;
  }

  const fetchPromise = (async () => {
    try {
      // 直接调用 CMS API，而不是自己的 API 路由
      const response = await cmsFetch(
        `${CMS_URL}/api/navigation-menus?where[visible][equals]=true&limit=1000&locale=${locale}&depth=1`,
        {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 300 }, // 缓存 5 分钟
        }
      );

      if (!response.ok) {
        console.error('[getNavigation] CMS error:', response.status);
        return [];
      }

      const data = await response.json();
      const allMenus = data.docs as PayloadNavMenu[];

      // 过滤出顶级菜单
      const topLevelMenus = allMenus.filter(menu => !menu.parent);

      // 转换数据
      const transformedData = await Promise.all(
        topLevelMenus
          .sort((a, b) => a.order - b.order)
          .map(item => transformNavigationItem(item, locale, allMenus))
      );

      return transformedData;
    } catch (error) {
      console.error('[getNavigation] Error:', error);
      return [];
    }
  })();

  navPromiseCache[locale] = fetchPromise;
  navCacheTime[locale] = now;
  return fetchPromise;
}
