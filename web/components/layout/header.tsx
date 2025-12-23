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

  // 5. 关键：IntersectionObserver + MutationObserver 逻辑
  // 支持 LazySection 动态渲染的场景
  useEffect(() => {
    let intersectionObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let observedElements = new Set<Element>();

    // 计算当前应该激活的主题
    const calculateActiveTheme = () => {
      const allSections = Array.from(document.querySelectorAll("[data-header-theme]"));
      if (allSections.length === 0) {
        setTheme("light");
        return;
      }

      const headerHeight = headerRef.current?.offsetHeight || 80;
      const triggerPoint = headerHeight;
      let activeSection: Element | null = null;
      let minTop = Infinity;

      allSections.forEach((section) => {
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
      const sections = document.querySelectorAll("[data-header-theme]");

      // 创建 observer（如果还没有）
      if (!intersectionObserver) {
        intersectionObserver = new IntersectionObserver(
          calculateActiveTheme,
          {
            rootMargin: "0px 0px -90% 0px",
            threshold: [0],
          }
        );
      }

      // 观察新元素
      sections.forEach((section) => {
        if (!observedElements.has(section)) {
          intersectionObserver!.observe(section);
          observedElements.add(section);
        }
      });

      // 移除已不存在的元素
      observedElements.forEach((element) => {
        if (!document.body.contains(element)) {
          intersectionObserver!.unobserve(element);
          observedElements.delete(element);
        }
      });

      // 立即计算一次
      calculateActiveTheme();
    };

    // 使用 setTimeout 确保 DOM 已经渲染完成
    const timer = setTimeout(() => {
      setupIntersectionObserver();

      // 使用 MutationObserver 监听 DOM 变化（LazySection 渲染新内容时）
      mutationObserver = new MutationObserver((mutations) => {
        let needsUpdate = false;

        mutations.forEach((mutation) => {
          // 检查是否有新增或移除的 data-header-theme 元素
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              if (node.hasAttribute('data-header-theme') ||
                  node.querySelector('[data-header-theme]')) {
                needsUpdate = true;
              }
            }
          });
          mutation.removedNodes.forEach((node) => {
            if (node instanceof Element) {
              if (node.hasAttribute('data-header-theme') ||
                  node.querySelector('[data-header-theme]')) {
                needsUpdate = true;
              }
            }
          });
        });

        if (needsUpdate) {
          // 延迟一帧确保 DOM 更新完成
          requestAnimationFrame(setupIntersectionObserver);
        }
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }, 100);

    // 滚动时也需要重新计算（处理快速滚动的情况）
    const handleScroll = () => {
      requestAnimationFrame(calculateActiveTheme);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [pathname]); // 当路由变化时重新运行

  const handleCloseMenu = () => {
    console.log('handleCloseMenu called! Setting isMenuOpen to false.');
    setIsMenuOpen(false);
  };

  // 6. 决定最终的样式 (来自你的 Demo 逻辑)
  // 如果菜单打开，强制为 'light' 主题
  const activeTheme = isMenuOpen ? "light" : theme;

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
