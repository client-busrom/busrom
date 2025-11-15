"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SWRConfig } from 'swr';
import { Preloader } from "@/components/Preloader"; // 确保你已创建 Preloader
import { ImageWall } from "@/components/image-wall"; // 确保你已创建 imageWall

// 定义 SWR 全局 fetcher
const fetcher = (resource: string) => fetch(resource).then(res => {
  if (!res.ok) throw new Error('An error occurred while fetching the data.');
  return res.json();
});

type LoadingStage = "loading" | "imageWall" | "done";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 检查是否是首页（任何语言的首页）
  const isHomePage = pathname === "/" || /^\/[a-z]{2}$/.test(pathname);

  // 初始化状态：为了避免 SSR/CSR 不匹配，初始状态总是 "loading"
  // 然后在 useEffect 中根据实际情况更新
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("loading");

  useEffect(() => {
    console.log('[ClientLayoutWrapper] useEffect 触发, isHomePage:', isHomePage, 'loadingStage:', loadingStage);

    // 如果不是首页，立即设置为 done
    if (!isHomePage) {
      console.log('[ClientLayoutWrapper] 非首页，设置为 done');
      setLoadingStage("done");
      return;
    }

    // 如果是首页，检查 sessionStorage，看动画是否已播放过
    const hasPlayedBefore = sessionStorage.getItem("preloaderDone") === "true";
    console.log('[ClientLayoutWrapper] 首页，hasPlayedBefore:', hasPlayedBefore);

    if (hasPlayedBefore) {
      console.log('[ClientLayoutWrapper] 检测到 sessionStorage 中有 preloaderDone，立即设置为 done');
      setLoadingStage("done");
    }
    // 如果没有播放过，保持 "loading" 状态，等待动画播放
  }, [isHomePage]);

  // 回调函数，用于 Preloader 完成时调用
  const handleLoadingComplete = useCallback(() => {
    console.log('[ClientLayoutWrapper] handleLoadingComplete 被调用');
    // 只有在 loadingStage 为 "loading" 时才切换到 imageWall
    setLoadingStage((prev) => {
      if (prev === "loading") {
        console.log('[ClientLayoutWrapper] 切换到 imageWall');
        return "imageWall";
      }
      console.log('[ClientLayoutWrapper] 状态不是 loading，忽略切换，当前状态:', prev);
      return prev;
    });
  }, []);

  // 回调函数，用于 ImageWall 完成时调用
  const handleImageWallComplete = useCallback(() => {
    console.log('[ClientLayoutWrapper] handleImageWallComplete 被调用');
    sessionStorage.setItem("preloaderDone", "true");
    setLoadingStage("done");
  }, []);

  console.log('[ClientLayoutWrapper] 渲染, loadingStage:', loadingStage);

  return (
    // SWRConfig 包裹所有内容，为整个应用提供 SWR 上下文
    <SWRConfig value={{ fetcher }}>

      {/* 内容层：
        始终渲染子页面 (Header, main, Footer)，但通过 opacity 控制其可见性。
        这确保了 SSR 的内容在动画播放时已存在于 DOM 中。
      */}
      <div
        className={`transition-opacity duration-700 ${loadingStage === 'done' ? 'opacity-100' : 'opacity-0'}`}
      >
        {children}
      </div>

      {/* 动画层：
        仅在动画未完成时渲染。它会覆盖在内容层之上。
      */}
      {loadingStage === "loading" && (
        <Preloader onLoadingComplete={handleLoadingComplete} />
      )}
      {loadingStage === "imageWall" && (
        <ImageWall
          isActive={true}
          onComplete={handleImageWallComplete}
        />
      )}
    </SWRConfig>
  );
}