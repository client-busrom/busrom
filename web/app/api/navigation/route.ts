import { NextRequest, NextResponse } from 'next/server';
import { NavigationMenuType, type NavItem } from '@/types/navigation';

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002';

/**
 * Payload CMS 导航菜单数据类型
 */
interface PayloadNavMenu {
  id: string;
  name: string; // 已经是单语言（通过 locale 参数获取）
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
async function getRandomImageFromMediaTags(mediaTags: Array<{ id: string; name: string }>, locale: string): Promise<{ url: string; filename: string } | null> {
  if (!mediaTags || mediaTags.length === 0) return null;

  try {
    // 使用第一个 mediaTag 的 ID 查询图片
    // 只查询场景图 (primaryCategory = 2, name = "scene")
    // 获取多张图片然后随机选择一张
    const tagId = mediaTags[0].id;
    const response = await fetch(
      `${CMS_URL}/api/media?where[tags][in]=${tagId}&where[primaryCategory][equals]=2&limit=20&locale=${locale}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // 缓存 5 分钟
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.docs && data.docs.length > 0) {
      // 随机选择一张图片
      const randomIndex = Math.floor(Math.random() * data.docs.length);
      const media = data.docs[randomIndex];
      return {
        url: media.url,
        filename: media.filename,
      };
    }
  } catch (error) {
    console.error('[Navigation API] Error fetching media:', error);
  }

  return null;
}

/**
 * 转换函数：将 Payload CMS 数据转换为前端期望的格式
 * @param item - 当前菜单项
 * @param locale - 语言
 * @param allMenus - 所有菜单（用于查找子菜单）
 * @param parentType - 父菜单的类型（用于子菜单继承）
 */
async function transformNavigationItem(
  item: PayloadNavMenu,
  locale: string,
  allMenus: PayloadNavMenu[],
  parentType?: string
): Promise<NavItem> {
  // 转换类型：小写转大写下划线
  const typeMap: Record<string, NavigationMenuType> = {
    'standard': NavigationMenuType.STANDARD,
    'product_cards': NavigationMenuType.PRODUCT_CARDS,
    'submenu': NavigationMenuType.SUBMENU,
  };

  const result: NavItem = {
    id: item.id,
    label: item.name || 'Untitled',
    url: item.link || '#',
    type: typeMap[item.type] || NavigationMenuType.STANDARD,
    icon: item.icon,
    openInNewTab: false,
    order: item.order,
  };

  // 添加询单链接
  if (item.inquiryLink) {
    result.inquiryLink = item.inquiryLink;
  }

  // 获取图片的条件：
  // 1. 自身是 product_cards 类型
  // 2. 或者父菜单是 product_cards 类型（子菜单继承）
  const shouldFetchImage = item.type === 'product_cards' || parentType === 'product_cards';

  if (shouldFetchImage && item.mediaTags && item.mediaTags.length > 0) {
    const image = await getRandomImageFromMediaTags(item.mediaTags, locale);
    if (image) {
      result.image = image;
    }
  }

  // 查找子菜单
  const children = allMenus.filter(menu => {
    if (!menu.parent) return false;
    const parentId = typeof menu.parent === 'string' ? menu.parent : menu.parent.id;
    return parentId === item.id;
  });

  // 递归转换子菜单，传递当前菜单的类型
  if (children.length > 0) {
    result.childMenus = await Promise.all(
      children
        .sort((a, b) => a.order - b.order)
        .map(child => transformNavigationItem(child, locale, allMenus, item.type))
    );
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';

    console.log('[Navigation API] Fetching navigation from Payload CMS for locale:', locale);

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
        .map(item => transformNavigationItem(item, locale, allMenus))
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
