import { NextRequest, NextResponse } from 'next/server';
import { keystoneClient } from '@/lib/keystone-client';
import { gql } from '@apollo/client';
import type { NavItem, NavItemRaw } from '@/types/navigation';

// GraphQL 查询 - 获取所有可见菜单
const GET_NAVIGATION = gql`
  query GetNavigation {
    navigationMenus(
      where: { visible: { equals: true } }
      orderBy: { order: asc }
    ) {
      id
      name
      type
      icon
      link
      inquiryLink
      order
      parent {
        id
      }
      children(
        where: { visible: { equals: true } }
        orderBy: { order: asc }
      ) {
        id
        name
        type
        icon
        link
        inquiryLink
        order
        randomImage {
          url
          filename
        }
      }
    }
  }
`;

/**
 * 转换函数：将多语言 GraphQL 数据转换为单语言 REST API 格式
 */
function transformNavigationItem(item: NavItemRaw, locale: string): NavItem {
  const result: NavItem = {
    id: item.id,
    label: item.name[locale] || item.name['en'] || 'Untitled',
    url: item.link,
    type: item.type as any,
    icon: item.icon,
    openInNewTab: false,
    order: item.order,
  };

  // 添加询单链接（如果存在）
  if (item.inquiryLink) {
    result.inquiryLink = item.inquiryLink;
  }

  // 添加图片（如果存在）
  if (item.randomImage) {
    result.image = {
      url: item.randomImage.url,
      filename: item.randomImage.filename,
    };
  }

  // 递归转换子菜单
  if (item.children && item.children.length > 0) {
    result.childMenus = item.children.map(child => transformNavigationItem(child, locale));
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';

    // 查询 GraphQL
    const { data, error } = await keystoneClient.query({
      query: GET_NAVIGATION,
    });

    if (error) {
      console.error('GraphQL error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch navigation data' },
        { status: 500 }
      );
    }

    // 过滤出顶级菜单（parent === null）
    const navigationMenus = data.navigationMenus as NavItemRaw[];
    const topLevelMenus = navigationMenus.filter(menu => !menu.parent);

    // 转换数据：提取对应语言的文本
    const transformedData = topLevelMenus.map(item =>
      transformNavigationItem(item, locale)
    );

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
