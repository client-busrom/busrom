"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { MobileMenu } from "./mobile-menu";
import { DesktopMenu } from "./desktop-menu";
import type { NavItem } from "@/types/navigation";
import useSWR from "swr";

// 1. 定义 Header 的主题类型
type HeaderTheme = "transparent" | "light" | "dark";

export default function Header({ locale }: { locale: string }) {
  // 2. 状态：用于移动端菜单
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 3. 状态：用于滚动时的主题
  const [theme, setTheme] = useState<HeaderTheme>("transparent");
  const headerRef = useRef<HTMLElement>(null);

  // 监听路由变化
  const pathname = usePathname();

  // 4. 关键：使用 SWR 获取导航数据
  // SWR 会自动使用 ClientLayoutWrapper 中提供的全局 fetcher
  const { data: navigationItems } = useSWR<NavItem[]>(`/api/navigation?locale=${locale}`);

  // 5. 关键：IntersectionObserver 逻辑
  useEffect(() => {
    // 使用 setTimeout 确保 DOM 已经渲染完成
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll("[data-header-theme]");
      if (sections.length === 0) {
        // 如果没有找到任何 section，默认设置为 light
        setTheme("light");
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          // 收集所有带 data-header-theme 的元素及其位置信息
          const allSections = Array.from(document.querySelectorAll("[data-header-theme]"));

          // Header 高度约为 80px
          const headerHeight = headerRef.current?.offsetHeight || 80;

          // 找到与 header 底部相交或已经通过 header 的元素中，最靠近顶部的那个
          let activeSection: Element | null = null;
          let minTop = Infinity;

          allSections.forEach((section) => {
            const rect = section.getBoundingClientRect();

            // 元素的顶部已经到达或通过了 header 底部，且元素底部还在视口中
            const hasPassedHeader = rect.top <= headerHeight && rect.bottom > 0;

            if (hasPassedHeader && rect.top < minTop) {
              minTop = rect.top;
              activeSection = section;
            }
          });

          if (activeSection) {
            const newTheme = (activeSection as HTMLElement).dataset.headerTheme as HeaderTheme;
            console.log('Setting theme to:', newTheme, 'element top:', minTop);
            setTheme(newTheme);
          }
        },
        {
          rootMargin: "0px",
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        }
      );

      sections.forEach((section) => observer.observe(section));

      return () => {
        sections.forEach((section) => observer.unobserve(section));
        observer.disconnect();
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]); // 当路由变化时重新运行

  const handleCloseMenu = () => {
    console.log('handleCloseMenu called! Setting isMenuOpen to false.');
    setIsMenuOpen(false);
  };

  // 6. 决定最终的样式 (来自你的 Demo 逻辑)
  // 如果菜单打开，强制为 'light' 主题
  const activeTheme = isMenuOpen ? "light" : theme;
  console.log(theme);

  // 动态计算文字和背景色
  const headerBgColor = activeTheme === "transparent" ? "bg-transparent" : "bg-brand-main";
  const headerTextColor = activeTheme === "transparent" ? "text-white" : "text-brand-text-main";
  const headerHoverBg = activeTheme === "transparent" ? "hover:bg-white/10" : "hover:bg-black/10";

  return (
    <>
      <header
        ref={headerRef}
        className={cn("fixed top-0 left-0 right-0 w-full z-[60] transition-all duration-300 ease-in-out", headerBgColor)}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧：汉堡菜单按钮 */}
            <div className="flex-1 flex justify-start">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className={cn(
                  "p-2 rounded-md transition-colors duration-200",
                  headerTextColor,
                  headerHoverBg
                )}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* 中间：Logo */}
            <div className="flex-1 flex justify-center">
              <Link href={`/${locale}`}>
                <h1 className={cn("text-3xl tracking-wider font-paytone-one transition-colors duration-300", headerTextColor)}>
                  Busrom
                </h1>
              </Link>
            </div>

            {/* 右侧：语言选择 */}
            <div className="flex-1 flex justify-end">
              <LocaleSwitcher activeTheme={activeTheme} />
            </div>
          </div>
        </div>
      </header>

      {/* 桌面端菜单 */}
      <DesktopMenu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        navigationItems={navigationItems || []}
      />

      {/* 移动端菜单 */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        navigationItems={navigationItems || []}
      />
    </>
  );
}
