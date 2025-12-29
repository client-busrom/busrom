"use client";

import { useState, useCallback, useEffect } from 'react';
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

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  preloaderConfig: PreloaderConfigData;
}

type LoadingStage = "loading" | "imageWall" | "done";

export function ClientLayoutWrapper({ children, preloaderConfig }: ClientLayoutWrapperProps) {
  // 初始状态：如果 preloader 禁用则直接 done，否则先设为 loading
  // 实际的 sessionStorage 检查在 useEffect 中进行，避免 hydration mismatch
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(
    preloaderConfig.enabled ? "loading" : "done"
  );

  // 客户端检查 sessionStorage，如果已显示过则跳过 preloader
  useEffect(() => {
    if (!preloaderConfig.enabled) return;
    try {
      if (sessionStorage.getItem(PRELOADER_SHOWN_KEY) === 'true') {
        setLoadingStage("done");
      }
    } catch (e) {
      // sessionStorage 不可用，继续显示 preloader
    }
  }, [preloaderConfig.enabled]);

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

      {/* ImageWall - 只在图片墙阶段渲染 */}
      {showImageWall && (
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
