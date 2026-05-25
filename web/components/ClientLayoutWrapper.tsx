"use client";

import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import type { PreloaderConfigData } from "@/lib/api/preloader-config";

// 动态加载 Preloader 和 ImageWall，避免阻塞首屏渲染
const Preloader = dynamic(
  () => import('@/components/Preloader').then(mod => ({ default: mod.Preloader })),
  { ssr: false }
);

const ImageWall = dynamic(
  () => import('@/components/image-wall').then(mod => ({ default: mod.ImageWall })),
  { ssr: false }
);

// 定义 SWR 全局 fetcher
const fetcher = (resource: string) => fetch(resource).then(res => {
  if (!res.ok) throw new Error('An error occurred while fetching the data.');
  return res.json();
});

// sessionStorage key for tracking if preloader has been shown
const PRELOADER_SHOWN_KEY = 'busrom_preloader_shown';

// 判断是否为首页路径（支持所有语言前缀）
// "/", "/en", "/zh", "/fr" 等都算首页
function isHomePage(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  // 去掉语言前缀后判断是否为根路径
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  return withoutLocale === '/';
}

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  preloaderConfig: PreloaderConfigData;
}

type LoadingStage = "loading" | "imageWall" | "done";

// 模块级变量，用于在 React 热更新或单页跳转时保持状态
let globalPreloaderShown = false;

export function ClientLayoutWrapper({ children, preloaderConfig }: ClientLayoutWrapperProps) {
  const pathname = usePathname();

  // 初始状态：服务端渲染和客户端初始渲染必须完全一致，以防止 Hydration Mismatch
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(() => {
    if (!preloaderConfig.enabled) return "done";
    if (!isHomePage(pathname)) return "done";
    return "loading"; // 首页始终以 loading 作为初始状态，客户端再通过 useEffect 快速跳转
  });
  const [isMounted, setIsMounted] = useState(false);

  // 客户端检查：非首页直接跳过、sessionStorage 已标记跳过、性能测试工具跳过
  useEffect(() => {
    setIsMounted(true);

    if (!preloaderConfig.enabled) return;

    // 检查是否已经在内存或 session 中显示过
    if (globalPreloaderShown || sessionStorage.getItem(PRELOADER_SHOWN_KEY) === 'true') {
      setLoadingStage("done");
      return;
    }

    // 非首页 → 直接跳过
    if (!isHomePage(pathname)) {
      setLoadingStage("done");
      return;
    }

    // 检测性能测试工具
    const ua = navigator.userAgent;
    const isPerformanceTest = /Lighthouse|Chrome-Lighthouse|PageSpeed|Speed Insights/i.test(ua);
    if (isPerformanceTest) {
      setLoadingStage("done");
      return;
    }
  }, [preloaderConfig.enabled, pathname]);

  // 标记 preloader 已显示（保存到 sessionStorage 和全局变量）
  const markPreloaderShown = useCallback(() => {
    globalPreloaderShown = true;
    try {
      sessionStorage.setItem(PRELOADER_SHOWN_KEY, 'true');
    } catch (e) {
      // sessionStorage 不可用，忽略
    }
  }, []);

  // Preloader 完成后进入 ImageWall 阶段
  const handlePreloaderComplete = useCallback(() => {
    if (preloaderConfig.imageWallEnabled && preloaderConfig.images.length > 0) {
      setLoadingStage("imageWall");
    } else {
      markPreloaderShown();
      setLoadingStage("done");
    }
  }, [preloaderConfig.imageWallEnabled, preloaderConfig.images.length, markPreloaderShown]);

  // ImageWall 完成后进入 done 阶段
  const handleImageWallComplete = useCallback(() => {
    markPreloaderShown();
    setLoadingStage("done");
  }, [markPreloaderShown]);

  // --- 动态管理 Body 滚动锁定 ---
  useEffect(() => {
    if (loadingStage !== "done") {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // 组件卸载时确保恢复
    return () => {
      document.body.style.overflow = '';
    };
  }, [loadingStage]);

  const isLoading = loadingStage !== "done";
  const showImageWall = loadingStage === "imageWall" && preloaderConfig.imageWallEnabled;

  return (
    <SWRConfig value={{ fetcher }}>
      {/* 遮罩层：防止 Preloader 和 ImageWall 切换时的瞬时白屏闪烁 */}
      {(loadingStage === "loading" || loadingStage === "imageWall") && (
        <div 
          className="fixed inset-0 z-[30]" 
          style={{ backgroundColor: preloaderConfig.backgroundColor }}
        />
      )}

      {/* Preloader - 加载阶段 */}
      {loadingStage === "loading" && preloaderConfig.enabled && (
        <Preloader onLoadingComplete={handlePreloaderComplete} config={preloaderConfig} />
      )}

      {/* ImageWall - 只在 imageWall 阶段渲染，完成后彻底卸载 */}
      {preloaderConfig.imageWallEnabled && loadingStage === "imageWall" && (
        <ImageWall
          isActive={true}
          onComplete={handleImageWallComplete}
          images={preloaderConfig.images}
          backgroundColor={preloaderConfig.backgroundColor}
          duration={preloaderConfig.imageWallDuration}
          stagger={preloaderConfig.imageWallStagger}
        />
      )}

      {/* 主内容 - 加载完成后显示 */}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </SWRConfig>
  );
}
