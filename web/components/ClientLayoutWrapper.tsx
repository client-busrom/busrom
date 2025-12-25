"use client";

import { useState, useCallback } from 'react';
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

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  preloaderConfig: PreloaderConfigData;
}

type LoadingStage = "loading" | "imageWall" | "done";

export function ClientLayoutWrapper({ children, preloaderConfig }: ClientLayoutWrapperProps) {
  // 确定初始阶段
  const getInitialStage = (): LoadingStage => {
    if (!preloaderConfig.enabled) return "done";
    return "loading";
  };

  const [loadingStage, setLoadingStage] = useState<LoadingStage>(getInitialStage);

  // Preloader 完成后进入 ImageWall 阶段
  const handlePreloaderComplete = useCallback(() => {
    if (preloaderConfig.imageWallEnabled && preloaderConfig.images.length > 0) {
      setLoadingStage("imageWall");
    } else {
      setLoadingStage("done");
    }
  }, [preloaderConfig.imageWallEnabled, preloaderConfig.images.length]);

  // ImageWall 完成后进入 done 阶段
  const handleImageWallComplete = useCallback(() => {
    setLoadingStage("done");
  }, []);

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
