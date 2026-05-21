"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { MobileMenu } from "./mobile-menu";
import { DesktopNavigation } from "./desktop-navigation";
import { ContactPopup } from "./contact-popup";
import { TawkChat, useTawkChat } from "./tawk-chat";
import { FloatingContactButtons } from "./floating-contact-buttons";
import type { NavItem } from "@/types/navigation";
import type { ContactPopupData } from "@/lib/api/contact-popup";
import useSWR from "swr";

// 1. 定义 Header 的主题类型
type HeaderTheme = "transparent" | "light" | "dark";

interface HeaderProps {
  locale: string;
  initialNavigation?: NavItem[]; // SSR 预取的导航数据
  contactPopupData?: ContactPopupData | null;
}

export default function Header({ locale, initialNavigation, contactPopupData }: HeaderProps) {
  // 2. 状态：用于移动端菜单
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 状态：桌面端下拉菜单是否展开
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 状态：Contact Popup 是否打开
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);

  // Tawk Chat 控制
  const { openChat } = useTawkChat();

  // 3. 状态：用于滚动时的主题
  const [theme, setTheme] = useState<HeaderTheme>("light");
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
    },
  );

  // 5. 关键：IntersectionObserver + MutationObserver 逻辑
  // 支持 LazySection 动态渲染的场景
  // 🚀 使用 GSAP ScrollTrigger 接管变色逻辑 (极致性能 & 稳定性)
  useEffect(() => {
    let ctx: any;
    let mutationObserver: MutationObserver | null = null;

    const initScrollTrigger = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      // 如果之前的 ScrollTrigger 还在，先全部清理掉，防止重复触发
      ScrollTrigger.getAll().forEach((st: any) => st.kill());

      ctx = gsap.context(() => {
        const sections = document.querySelectorAll("[data-header-theme]");

        // --- 立即检测逻辑：确保初始化时主题正确 ---
        let detectedTheme: string | null = null;
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          // 如果板块正在覆盖 Header 区域 (Header 高度约 46px)
          if (rect.top <= 50 && rect.bottom >= 20) {
            detectedTheme = section.getAttribute("data-header-theme");
          }
        });
        if (detectedTheme) setTheme(detectedTheme as any);
        // ---------------------------------------

        sections.forEach((section) => {
          const theme = section.getAttribute("data-header-theme");
          if (!theme) return;

          ScrollTrigger.create({
            trigger: section,
            start: "top 2.4vw", // 桌面端 2.4vw (对应 1920 下 46px)
            end: "bottom 2.4vw",
            onEnter: () => setTheme(theme as any),
            onEnterBack: () => setTheme(theme as any),
            // 确保在刷新或初次加载时激活正确的主题
            onRefresh: (self) => {
              if (self.isActive) setTheme(theme as any);
            },
          });
        });
      });
    };

    // 1. 延迟初始化，给 LazySection 留出渲染时间
    const timer = setTimeout(initScrollTrigger, 300);

    // 2. 监听 DOM 结构变化 (如 DeferredContent 加载新板块)
    mutationObserver = new MutationObserver((mutations) => {
      const hasRelevantChanges = mutations.some((m) =>
        Array.from(m.addedNodes).some(
          (n) =>
            n instanceof Element &&
            (n.hasAttribute("data-header-theme") ||
              n.querySelector("[data-header-theme]")),
        ),
      );
      if (hasRelevantChanges) {
        initScrollTrigger(); // 重新扫描新加入的板块
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      if (mutationObserver) mutationObserver.disconnect();
      if (ctx) ctx.revert();
      // 彻底清理
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((st: any) => st.kill());
      });
    };
  }, [pathname]); // 路由切换时重新绑定

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  // 6. 决定最终的样式 (来自你的 Demo 逻辑)
  // 如果菜单打开（移动端或桌面端下拉），强制为 'light' 主题
  const activeTheme = isMenuOpen || isDropdownOpen ? "light" : theme;

  // 动态计算文字和背景色
  const headerBgColor =
    activeTheme === "transparent" ? "bg-transparent" : "bg-brand-main";
  const headerTextColor =
    activeTheme === "transparent" ? "text-white" : "text-brand-text-main";
  const headerHoverBg =
    activeTheme === "transparent" ? "hover:bg-white/10" : "hover:bg-black/10";
  const headerShadow = isDropdownOpen ? "shadow-md" : "";

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 w-full z-[70] lg:h-[2.4vw] transition-all duration-300 ease-in-out",
          headerBgColor,
          headerShadow,
        )}
      >
        <div className="w-full h-full px-4 lg:px-6 xl:px-10 flex items-center justify-between">
          {/* 移动端布局：三列，Logo居中 (保持原有移动端尺寸设定 py-2) */}
          <div className="flex lg:hidden items-center justify-between w-full relative py-2">
            {/* 左侧：汉堡菜单按钮 */}
            <button
              onClick={(event) => {
                event.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className={cn(
                "p-2 rounded-md transition-colors duration-200",
                headerTextColor,
                headerHoverBg,
              )}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* 中间：Logo 居中 */}
            <Link
              href={`/${locale}`}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <h1
                className={cn(
                  "text-2xl tracking-wider font-paytone-one transition-colors duration-300",
                  headerTextColor,
                )}
              >
                Busrom
              </h1>
            </Link>

            {/* 右侧：语言选择 */}
            <LocaleSwitcher activeTheme={activeTheme} />
          </div>

          {/* 桌面端布局：完全采用 dvw 比例流派 */}
          <div className="hidden lg:flex items-center justify-between w-full h-full">
            {/* 左侧：Logo */}
            <div className="flex items-center h-full">
              <Link href={`/${locale}`}>
                <h1
                  className={cn(
                    "text-[1.56vw] leading-[1.88vw] tracking-wider font-paytone-one transition-colors duration-300",
                    headerTextColor,
                  )}
                >
                  Busrom
                </h1>
              </Link>
            </div>

            {/* 中间：桌面端导航 */}
            <div className="flex flex-1 justify-center h-full items-center">
              <DesktopNavigation
                navigationItems={navigationItems || []}
                theme={activeTheme}
                onMenuOpen={setIsDropdownOpen}
                onContactClick={() => {
                  setIsContactPopupOpen(true);
                  setIsDropdownOpen(false);
                }}
              />
            </div>

            {/* 右侧：语言选择 */}
            <div className="flex items-center h-full">
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
        onContactClick={() => setIsContactPopupOpen(true)}
      />

      {/* Contact Popup */}
      <ContactPopup
        data={contactPopupData || null}
        isOpen={isContactPopupOpen}
        onClose={() => setIsContactPopupOpen(false)}
        onChatClick={() => {
          setIsContactPopupOpen(false);
          openChat();
        }}
      />

      {/* Floating Contact Buttons (WhatsApp + Email) */}
      <FloatingContactButtons data={contactPopupData || null} />

      {/* Tawk.to Chat Widget */}
      <TawkChat
        propertyId={process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID}
        widgetId={process.env.NEXT_PUBLIC_TAWK_WIDGET_ID}
      />
    </>
  );
}
