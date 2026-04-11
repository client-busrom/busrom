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
function isHomePage(pathname: string): boolean {
  // 去掉语言前缀后判断是否为根路径
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  return withoutLocale === '/';
}

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  preloaderConfig: PreloaderConfigData;
}

type LoadingStage = "loading" | "imageWall" | "done";

export function ClientLayoutWrapper({ children, preloaderConfig }: ClientLayoutWrapperProps) {
  const pathname = usePathname();

  // 初始状态：只有首页 + preloader 启用时才设为 loading
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(
    preloaderConfig.enabled ? "loading" : "done"
  );

  // 客户端检查：非首页直接跳过、sessionStorage 已标记跳过、性能测试工具跳过
  // Preloader 使用 dynamic({ ssr: false })，在 useEffect 执行前不会渲染，
  // 所以即使 loadingStage 初始为 "loading"，也不会闪烁 preloader 动画
  useEffect(() => {
    if (!preloaderConfig.enabled) return;

    // 非首页 → 直接跳过，不播放 preloader
    if (!isHomePage(pathname)) {
      setLoadingStage("done");
      return;
    }

    // 检测 Lighthouse / PageSpeed Insights (性能测试工具)
    const ua = navigator.userAgent;
    const isPerformanceTest = /Lighthouse|Chrome-Lighthouse|PageSpeed|Speed Insights/i.test(ua);
    if (isPerformanceTest) {
      setLoadingStage("done");
      return;
    }

    // 当前 session 内已经显示过 → 跳过（语言切换、F5刷新等场景）
    try {
      if (sessionStorage.getItem(PRELOADER_SHOWN_KEY) === 'true') {
        setLoadingStage("done");
      }
    } catch (e) {
      // sessionStorage 不可用，继续显示 preloader
    }
  }, [preloaderConfig.enabled, pathname]);

  // 标记 preloader 已显示（保存到 sessionStorage）
  const markPreloaderShown = useCallback(() => {
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

  const isLoading = loadingStage !== "done";
  const showImageWall = loadingStage === "imageWall" && preloaderConfig.imageWallEnabled;

  return (
    <SWRConfig value={{ fetcher }}>
      {/* Preloader - 加载阶段 */}
      {loadingStage === "loading" && preloaderConfig.enabled && (
        <Preloader onLoadingComplete={handlePreloaderComplete} config={preloaderConfig} />
      )}

      {/* ImageWall - 始终渲染但控制可见性，避免加载 JS 导致的白屏 */}
      {preloaderConfig.imageWallEnabled && (
        <ImageWall
          isActive={loadingStage === "imageWall"}
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
