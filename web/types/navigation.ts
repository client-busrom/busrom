/**
 * 导航菜单类型定义
 *
 * 这些类型用于前端组件，数据来自 REST API 转换层
 * API 会将 GraphQL 的多语言 JSON 字段转换为单语言字符串
 */

/**
 * 导航菜单类型枚举
 */
export enum NavigationMenuType {
  STANDARD = 'STANDARD',           // 普通菜单（如 Home, Service）
  PRODUCT_CARDS = 'PRODUCT_CARDS', // 产品卡片菜单（如 Shop, Product）
  SUBMENU = 'SUBMENU',             // 带图标的子菜单（如 About Us）
}

/**
 * 导航菜单图片
 */
export interface NavigationImage {
  url: string;
  filename: string;
}

/**
 * 导航菜单项（REST API 返回格式）
 */
export interface NavItem {
  id: string;
  label: string;                    // 已转换为单语言
  url: string;
  type: NavigationMenuType;
  icon?: string;
  openInNewTab: boolean;
  order: number;
  image?: NavigationImage;          // 子菜单可能有图片
  inquiryLink?: string;             // 询单链接（仅用于 PRODUCT_CARDS 类型）
  childMenus?: NavItem[];           // 子菜单
}

/**
 * GraphQL 原始数据格式（仅用于 API Route）
 */
export interface NavItemRaw {
  id: string;
  name: Record<string, string>;     // 多语言 JSON: { en: "...", zh: "..." }
  type: string;
  icon?: string;
  link: string;
  inquiryLink?: string;             // 询单链接
  order: number;
  parent?: { id: string } | null;
  children?: NavItemRaw[];
  randomImage?: {
    url: string;
    filename: string;
  };
}
