"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";
import { ChevronDown } from "lucide-react";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getOptimizedImageUrl } from "@/lib/image-utils";

interface DesktopNavigationProps {
  navigationItems: NavItem[];
  theme: "transparent" | "light" | "dark";
  onMenuOpen?: (isOpen: boolean) => void;
  onContactClick?: () => void;
}

// 从 URL 中提取产品 slug
const getProductSlug = (url: string): string | null => {
  if (!url) return null;
  // 匹配形如 /products/slug 或 /shop/slug 或 /products/slug/ 或 /shop/slug/ 的格式
  const match = url.match(/\/(?:products|shop)\/([^/?#]+)/);
  if (match) {
    // 移除可能存在的末尾斜杠
    return match[1].replace(/\/$/, "");
  }
  return null;
};

export function DesktopNavigation({
  navigationItems,
  theme,
  onMenuOpen,
  onContactClick,
}: DesktopNavigationProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 预加载所有菜单图片 - 使用 link preload 更早加载
  useEffect(() => {
    if (imagesPreloaded || navigationItems.length === 0) return;

    const imageUrls: string[] = [];
    navigationItems.forEach((item) => {
      if (item.childMenus) {
        item.childMenus.forEach((child) => {
          if (child.image?.url) {
            imageUrls.push(getOptimizedImageUrl(child.image as any, 'medium'));
          }
        });
      }
    });

    // 使用 link preload 进行预加载（更快）
    const preloadLinks: HTMLLinkElement[] = [];
    imageUrls.forEach((url, index) => {
      // 清理已存在的相同 URL 的预加载
      const existingLink = document.querySelector(
        `link[href="${url}"][rel="preload"]`,
      );
      if (existingLink) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      link.setAttribute("data-nav-preload", "true");
      // 前4张高优先级
      if (index < 4) {
        link.setAttribute("fetchpriority", "high");
      }
      document.head.appendChild(link);
      preloadLinks.push(link);
    });

    // 同时使用 Image 对象确保完全加载
    let loadedCount = 0;
    const totalImages = imageUrls.length;
    imageUrls.forEach((url) => {
      const img = new window.Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesPreloaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesPreloaded(true);
        }
      };
      img.src = url;
    });

    // 如果没有图片，直接标记为已预加载
    if (imageUrls.length === 0) {
      setImagesPreloaded(true);
    }

    // 清理函数
    return () => {
      preloadLinks.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [navigationItems, imagesPreloaded]);

  // 通知父组件菜单展开状态
  useEffect(() => {
    onMenuOpen?.(activeMenuId !== null);
  }, [activeMenuId, onMenuOpen]);

  // 按 order 排序所有菜单项
  const sortedItems = useMemo(() => {
    return [...navigationItems].sort((a, b) => a.order - b.order);
  }, [navigationItems]);

  // 点击菜单项
  const handleMenuClick = (item: NavItem, e: React.MouseEvent) => {
    // Product 和 Shop 点击直接跳转（悬停展开子菜单）
    // 其他有子菜单的项点击切换展开状态
    const isProductOrShop = item.url === "/products" || item.url === "/shop";

    if (item.childMenus && item.childMenus.length > 0 && !isProductOrShop) {
      e.preventDefault();
      setActiveMenuId(activeMenuId === item.id ? null : item.id);
    } else {
      // 没有子菜单或是 Product/Shop，关闭当前展开的菜单并跳转
      setActiveMenuId(null);
    }
  };

  // 悬停打开子菜单
  const handleMouseEnter = (item: NavItem) => {
    if (item.childMenus && item.childMenus.length > 0) {
      setActiveMenuId(item.id);
    }
  };

  // 悬停离开关闭子菜单
  const handleMouseLeave = () => {
    setActiveMenuId(null);
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 计算文字颜色
  const textColor =
    theme === "transparent" ? "text-white" : "text-brand-text-main";
  const hoverColor =
    theme === "transparent"
      ? "hover:text-white/80"
      : "hover:text-brand-secondary";

  // 获取当前激活的菜单项
  const activeItem = activeMenuId
    ? navigationItems.find((item) => item.id === activeMenuId)
    : null;

  return (
    <>
      <div
        ref={menuRef}
        className="flex items-center gap-6"
        onMouseLeave={handleMouseLeave}
      >
        {sortedItems.map((item) => {
          const hasChildren = item.childMenus && item.childMenus.length > 0;
          const isActive = activeMenuId === item.id;

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item)}
            >
              {item.url === '#contact-popup' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onContactClick?.();
                  }}
                  className={cn(
                    "relative flex items-center gap-1 text-[0.73vw] leading-[1.04vw] font-montserrat font-bold transition-colors py-2",
                    textColor,
                    hoverColor,
                  )}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  href={item.url}
                  onClick={(e) => handleMenuClick(item, e)}
                  className={cn(
                    "relative flex items-center gap-1 text-[0.73vw] leading-[1.04vw] font-montserrat font-bold transition-colors py-2",
                    textColor,
                    hoverColor,
                    isActive && "text-brand-secondary",
                  )}
                >
                  {item.label}
                  {/* 箭头图标（有子菜单时显示） */}
                  {hasChildren && (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isActive && "rotate-180",
                      )}
                    />
                  )}
                  {/* 下划线指示器（有子菜单且激活时显示） */}
                  {hasChildren && (
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 w-full h-0.5 bg-current transition-transform duration-200 origin-left",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  )}
                </Link>
              )}
            </div>
          );
        })}

      </div>

      {/* 二级菜单下拉 - 全屏宽度 */}
      <AnimatePresence>
        {activeItem &&
          activeItem.childMenus &&
          activeItem.childMenus.length > 0 && (
            <>
              {/* 背景遮罩 - 从 header 下方开始 */}
              <motion.div
                key="nav-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/30"
                style={{ top: "2.4vw" }}
                onClick={() => setActiveMenuId(null)}
              />

              {/* 下拉菜单 - 紧贴 header 底部 */}
              <motion.div
                key={activeItem.id}
                ref={dropdownRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="fixed left-0 right-0 z-[55] bg-brand-main shadow-lg"
                style={{
                  top: "2.4vw",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                onWheel={(e) => e.stopPropagation()}
                onMouseEnter={() => setActiveMenuId(activeMenuId)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="container mx-auto px-4 lg:px-[66px] py-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  {(() => {
                    // PRODUCT_CARDS 类型 - 产品卡片网格
                    if (activeItem.type === "PRODUCT_CARDS") {
                      return (
                        <div className="grid gap-2.5 grid-cols-1 lg:grid-cols-4">
                          {activeItem.childMenus.map((child, index) => {
                            const span = child.gridSpan || 1;
                            const colSpanClass =
                              span === 4 ? "lg:col-span-4" :
                              span === 3 ? "lg:col-span-3" :
                              span === 2 ? "lg:col-span-2" : "";

                            return (
                              <div
                                key={child.id}
                                className={cn(
                                  "group relative w-full h-[360px] overflow-hidden rounded-lg bg-muted cursor-pointer",
                                  colSpanClass,
                                )}
                              >
                                <div className="absolute inset-0 overflow-hidden bg-white">
                                  {child.image?.url ? (
                                    <OptimizedImage
                                      image={child.image as any}
                                      alt={child.label}
                                      size={span > 1 ? "large" : "medium"}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                      priority={index < 4}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-border bg-muted">
                                      <span className="text-muted-foreground text-xs">
                                        No Image
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="absolute top-4 left-4 z-10">
                                  <p className="text-lg font-montserrat font-bold text-white drop-shadow-lg">
                                    {child.label}
                                  </p>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                  <Link
                                    href={child.url}
                                    className="flex-1 py-2 px-4 text-center text-sm font-montserrat font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                    onClick={() => setActiveMenuId(null)}
                                  >
                                    Learn More
                                  </Link>
                                  <Link
                                    href={child.inquiryLink || "/contact-us"}
                                    className="flex-1 py-2 px-4 text-center text-sm font-montserrat font-bold bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                                    onClick={() => setActiveMenuId(null)}
                                  >
                                    Inquiry
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    // SUBMENU 类型 - 带图标的菜单
                    if (activeItem.type === "SUBMENU") {
                      return (
                        <div className="grid grid-cols-4 gap-x-6 gap-y-8 max-w-[1400px] mx-auto justify-items-center">
                          {activeItem.childMenus.map((child) => (
                            <Link
                              key={child.id}
                              href={child.url}
                              className="group flex flex-col items-center justify-center gap-4 py-6 w-[330px] rounded-lg transition-colors hover:bg-white/5"
                              onClick={() => setActiveMenuId(null)}
                            >
                              <div className="text-muted-foreground group-hover:text-brand-accent-gold transition-colors">
                                {child.icon ? (
                                  <IconifyIcon
                                    name={child.icon}
                                    size={40}
                                    color="currentColor"
                                  />
                                ) : (
                                  <IconifyIcon
                                    name="lucide:arrow-right"
                                    size={40}
                                    color="currentColor"
                                  />
                                )}
                              </div>
                              <span className="text-lg font-montserrat font-bold text-muted-foreground group-hover:text-brand-accent-gold text-center transition-colors whitespace-nowrap">
                                {child.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      );
                    }

                    // STANDARD 类型 - 普通列表
                    return (
                      <div className="grid grid-cols-4 gap-2 max-w-4xl mx-auto">
                        {activeItem.childMenus.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className="group px-4 py-3 rounded-md transition-colors"
                            onClick={() => setActiveMenuId(null)}
                          >
                            <span className="text-lg font-montserrat font-bold text-muted-foreground group-hover:text-brand-accent-gold transition-colors">
                              {child.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </>
          )}
      </AnimatePresence>
    </>
  );
}
