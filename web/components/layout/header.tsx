"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { MobileMenu } from "./mobile-menu";
import { DesktopNavigation } from "./desktop-navigation";
import type { NavItem } from "@/types/navigation";
import useSWR from "swr";

// 1. 定义 Header 的主题类型
type HeaderTheme = "transparent" | "light" | "dark";

interface HeaderProps {
  locale: string;
  initialNavigation?: NavItem[]; // SSR 预取的导航数据
}

export default function Header({ locale, initialNavigation }: HeaderProps) {
  // 2. 状态：用于移动端菜单
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 状态：桌面端下拉菜单是否展开
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 3. 状态：用于滚动时的主题
  const [theme, setTheme] = useState<HeaderTheme>("transparent");
  const headerRef = useRef<HTMLElement>(null);

  // 监听路由变化
  const pathname = usePathname();

  // 4. 关键：使用 SWR 获取导航数据，使用 SSR 预取的数据作为 fallback
  // 如果有 SSR 预取的数据，禁用首次加载时的重新验证，避免关键请求链
  const { data: navigationItems } = useSWR<NavItem[]>(
    `/api/navigation?locale=${locale}`,
    null,
    {
      fallbackData: initialNavigation,
      revalidateOnMount: !initialNavigation, // 有初始数据时不立即重新验证
      revalidateOnFocus: false, // 窗口获得焦点时不重新验证
    }
  );

  // 5. 关键：IntersectionObserver + MutationObserver 逻辑
  // 支持 LazySection 动态渲染的场景
  useEffect(() => {
    let intersectionObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let observedElements = new Set<Element>();
    
    // 缓存所有带有 data-header-theme 的元素，避免滚动时频繁查询 DOM
    let cachedSections: HTMLElement[] = [];

    const updateCachedSections = () => {
      cachedSections = Array.from(document.querySelectorAll("[data-header-theme]")) as HTMLElement[];
    };

    // 计算当前应该激活的主题
    const calculateActiveTheme = () => {
      if (cachedSections.length === 0) {
        setTheme("light");
        return;
      }

      const headerHeight = headerRef.current?.offsetHeight || 80;
      const triggerPoint = headerHeight;
      let activeSection: Element | null = null;
      let minTop = Infinity;

      cachedSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // 元素的顶部已经到达或通过了 header 底部，且元素底部还在视口中
        const hasPassedHeader = rect.top <= triggerPoint && rect.bottom > 0;

        if (hasPassedHeader && rect.top < minTop) {
          minTop = rect.top;
          activeSection = section;
        }
      });

      if (activeSection) {
        const newTheme = (activeSection as HTMLElement).dataset.headerTheme as HeaderTheme;
        setTheme(newTheme);
      }
    };

    // 设置或更新 IntersectionObserver
    const setupIntersectionObserver = () => {
      updateCachedSections(); // 更新缓存

      if (!intersectionObserver) {
        intersectionObserver = new IntersectionObserver(
          () => calculateActiveTheme(),
          {
            rootMargin: "0px 0px -90% 0px",
            threshold: [0],
          }
        );
      }

      cachedSections.forEach((section) => {
        if (!observedElements.has(section)) {
          intersectionObserver!.observe(section);
          observedElements.add(section);
        }
      });

      observedElements.forEach((element) => {
        if (!document.body.contains(element)) {
          intersectionObserver!.unobserve(element);
          observedElements.delete(element);
        }
      });

      calculateActiveTheme();
    };

    const timer = setTimeout(() => {
      setupIntersectionObserver();

      mutationObserver = new MutationObserver((mutations) => {
        let needsUpdate = false;
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element && (node.hasAttribute('data-header-theme') || node.querySelector('[data-header-theme]'))) {
              needsUpdate = true;
            }
          });
          mutation.removedNodes.forEach((node) => {
            if (node instanceof Element && (node.hasAttribute('data-header-theme') || node.querySelector('[data-header-theme]'))) {
              needsUpdate = true;
            }
          });
        });

        if (needsUpdate) {
          requestAnimationFrame(setupIntersectionObserver);
        }
      });

      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }, 100);

    // 滚动节流优化（Throttle）：限制计算频率，彻底解决滚动卡顿（Layout Thrashing）
    let throttleTimer: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        calculateActiveTheme();
        throttleTimer = null;
      }, 50); // 每 50ms 计算一次，足够平滑且极大地降低了性能消耗
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      if (throttleTimer) clearTimeout(throttleTimer);
      window.removeEventListener('scroll', handleScroll);
      if (intersectionObserver) intersectionObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [pathname]); // 当路由变化时重新运行

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  // 6. 决定最终的样式 (来自你的 Demo 逻辑)
  // 如果菜单打开（移动端或桌面端下拉），强制为 'light' 主题
  const activeTheme = (isMenuOpen || isDropdownOpen) ? "light" : theme;

  // 动态计算文字和背景色
  const headerBgColor = activeTheme === "transparent" ? "bg-transparent" : "bg-brand-main";
  const headerTextColor = activeTheme === "transparent" ? "text-white" : "text-brand-text-main";
  const headerHoverBg = activeTheme === "transparent" ? "hover:bg-white/10" : "hover:bg-black/10";
  const headerShadow = isDropdownOpen ? "shadow-md" : "";

  return (
    <>
      <header
        ref={headerRef}
        className={cn("fixed top-0 left-0 right-0 w-full z-[70] transition-all duration-300 ease-in-out", headerBgColor, headerShadow)}
      >
        <div className="w-full px-4 lg:px-6 xl:px-10 py-2">
          {/* 移动端布局：三列，Logo居中 */}
          <div className="flex lg:hidden items-center justify-between relative">
            {/* 左侧：汉堡菜单按钮 */}
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

            {/* 中间：Logo 居中 */}
            <Link href={`/${locale}`} className="absolute left-1/2 -translate-x-1/2">
              <h1 className={cn("text-2xl tracking-wider font-paytone-one transition-colors duration-300", headerTextColor)}>
                Busrom
              </h1>
            </Link>

            {/* 右侧：语言选择 */}
            <LocaleSwitcher activeTheme={activeTheme} />
          </div>

          {/* 桌面端布局 */}
          <div className="hidden lg:flex items-center justify-between">
            {/* 左侧：Logo */}
            <div className="flex items-center">
              <Link href={`/${locale}`}>
                <h1 className={cn("text-3xl tracking-wider font-paytone-one transition-colors duration-300", headerTextColor)}>
                  Busrom
                </h1>
              </Link>
            </div>

            {/* 中间：桌面端导航 */}
            <div className="flex flex-1 justify-center">
              <DesktopNavigation
                navigationItems={navigationItems || []}
                theme={activeTheme}
                onMenuOpen={setIsDropdownOpen}
              />
            </div>

            {/* 右侧：语言选择 */}
            <div className="flex items-center">
              <LocaleSwitcher activeTheme={activeTheme} />
            </div>
          </div>
        </div>
      </header>

      {/* 移动端菜单 */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        navigationItems={navigationItems || []}
      />
    </>
  );
}
