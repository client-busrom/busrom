import { NavigationMenuType, type NavItem } from '@/types/navigation';

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002';

/**
 * Payload CMS 导航菜单数据类型
 */
interface PayloadNavMenu {
  id: string;
  name: string;
  type: string;
  icon?: string;
  link?: string;
  inquiryLink?: string;
  order: number;
  parent?: { id: string } | string | null;
  mediaTags?: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * 从媒体标签获取随机图片
 */
async function getRandomImageFromMediaTags(
  mediaTags: Array<{ id: string; name: string }>,
  locale: string
): Promise<{ url: string; filename: string } | null> {
  if (!mediaTags || mediaTags.length === 0) return null;

  try {
    const tagId = mediaTags[0].id;
    const response = await fetch(
      `${CMS_URL}/api/media?where[tags][in]=${tagId}&where[primaryCategory][equals]=2&limit=20&locale=${locale}`,
      {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.docs && data.docs.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.docs.length);
      const media = data.docs[randomIndex];
      return { url: media.url, filename: media.filename };
    }
  } catch (error) {
    console.error('[getNavigation] Error fetching media:', error);
  }

  return null;
}

/**
 * 修复旧版 /product/ URL 为 /products/
 */
function fixProductUrl(url: string | null | undefined): string {
  if (!url) return '#'
  return url.replace(/^\/product\//, '/products/')
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

  if (item.inquiryLink) {
    result.inquiryLink = item.inquiryLink;
  }

  const shouldFetchImage = item.type === 'product_cards' || parentType === 'product_cards';

  if (shouldFetchImage && item.mediaTags && item.mediaTags.length > 0) {
    const image = await getRandomImageFromMediaTags(item.mediaTags, locale);
    if (image) {
      result.image = image;
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
export async function getNavigation(locale: string): Promise<NavItem[]> {
  try {
    // 直接调用 CMS API，而不是自己的 API 路由
    const response = await fetch(
      `${CMS_URL}/api/navigation-menus?where[visible][equals]=true&limit=1000&locale=${locale}&depth=2`,
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
}
