"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import type { PreloaderConfigData } from "@/lib/api/preloader-config";

// 动态导入 Preloader 和 ImageWall（包含 GSAP），减少首屏 JS
const Preloader = dynamic(
  () => import("@/components/Preloader").then(mod => ({ default: mod.Preloader })),
  { ssr: false }
);
const ImageWall = dynamic(
  () => import("@/components/image-wall").then(mod => ({ default: mod.ImageWall })),
  { ssr: false }
);

// 定义 SWR 全局 fetcher
const fetcher = (resource: string) => fetch(resource).then(res => {
  if (!res.ok) throw new Error('An error occurred while fetching the data.');
  return res.json();
});

type LoadingStage = "loading" | "imageWall" | "done";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  preloaderConfig: PreloaderConfigData;
}

export function ClientLayoutWrapper({ children, preloaderConfig }: ClientLayoutWrapperProps) {
  const pathname = usePathname();

  // 检查是否是首页（任何语言的首页）
  const isHomePage = pathname === "/" || /^\/[a-z]{2}$/.test(pathname);

  // 初始化状态：为了避免 SSR/CSR 不匹配，初始状态总是 "loading"
  // 然后在 useEffect 中根据实际情况更新
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("loading");

  useEffect(() => {
    // 如果 preloader 被禁用，立即设置为 done
    if (!preloaderConfig.enabled) {
      setLoadingStage("done");
      return;
    }

    // 如果不是首页，立即设置为 done
    if (!isHomePage) {
      setLoadingStage("done");
      return;
    }

    // 如果是首页，检查 sessionStorage，看动画是否已播放过
    const hasPlayedBefore = sessionStorage.getItem("preloaderDone") === "true";

    if (hasPlayedBefore) {
      setLoadingStage("done");
    }
    // 如果没有播放过，保持 "loading" 状态，等待动画播放
  }, [isHomePage, preloaderConfig.enabled]);

  // 回调函数，用于 Preloader 完成时调用
  const handleLoadingComplete = useCallback(() => {
    // 只有在 loadingStage 为 "loading" 时才切换到 imageWall
    setLoadingStage((prev) => {
      if (prev === "loading") {
        return "imageWall";
      }
      return prev;
    });
  }, []);

  // 回调函数，用于 ImageWall 完成时调用
  const handleImageWallComplete = useCallback(() => {
    sessionStorage.setItem("preloaderDone", "true");
    setLoadingStage("done");
  }, []);

  // If preloader is disabled in CMS, skip directly to done
  const shouldShowPreloader = preloaderConfig.enabled && isHomePage;
  const shouldShowImageWall = preloaderConfig.imageWallEnabled;

  // 是否应该延迟渲染主内容（仅在首页 preloader 动画期间）
  const shouldDeferContent = shouldShowPreloader && loadingStage !== "done";

  return (
    // SWRConfig 包裹所有内容，为整个应用提供 SWR 上下文
    <SWRConfig value={{ fetcher }}>

      {/* 内容层：
        在 preloader 动画期间不渲染主内容，避免 3D Globe 等组件初始化阻塞主线程。
        动画完成后再渲染，确保 Logo 旋转流畅。
      */}
      {!shouldDeferContent && (
        <div
          className={`transition-opacity duration-700 ${loadingStage === 'done' ? 'opacity-100' : 'opacity-0'}`}
        >
          {children}
        </div>
      )}

      {/* 动画层：
        仅在动画未完成时渲染。它会覆盖在内容层之上。
      */}
      {loadingStage === "loading" && shouldShowPreloader && (
        <Preloader
          onLoadingComplete={handleLoadingComplete}
          config={preloaderConfig}
        />
      )}
      {loadingStage === "imageWall" && shouldShowImageWall && (
        <ImageWall
          isActive={true}
          onComplete={handleImageWallComplete}
          images={preloaderConfig.images}
          backgroundColor={preloaderConfig.backgroundColor}
          duration={preloaderConfig.imageWallDuration}
          stagger={preloaderConfig.imageWallStagger}
        />
      )}
    </SWRConfig>
  );
}
