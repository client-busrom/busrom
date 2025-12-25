"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** 占位符高度，避免布局抖动 */
  minHeight?: string;
  /** 提前多少像素开始加载 (rootMargin) */
  threshold?: number;
  /** 占位符背景色 */
  placeholderBg?: string;
  /** header 主题，用于滚动时正确显示 header 颜色 */
  headerTheme?: "light" | "dark" | "transparent";
}

/**
 * 懒加载区域包装器（单个模块用）
 * 不做懒加载，只保留 header theme 标记
 */
export function LazySection({
  children,
  headerTheme,
}: LazySectionProps) {
  return (
    <div data-header-theme={headerTheme}>
      {children}
    </div>
  );
}

interface DeferredContentProps {
  children: ReactNode;
  /** 提前多少像素开始加载 (rootMargin) */
  threshold?: number;
  /** 加载中显示的占位符 */
  fallback?: ReactNode;
}

/**
 * 延迟加载容器（用于首屏之后的所有内容）
 * 用户开始滚动或首屏渲染 2 秒后加载剩余内容
 *
 * 优化：使用低 z-index 的占位层，避免加载时闪白屏
 */
export function DeferredContent({
  children,
  fallback = null,
}: DeferredContentProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let loaded = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      setShouldRender(true);
      // 刷新 Lenis
      requestAnimationFrame(() => {
        if (typeof window !== "undefined" && (window as any).lenis) {
          (window as any).lenis.resize();
        }
      });
    };

    // 方式1: 用户开始滚动时立即加载
    const handleScroll = () => {
      load();
      window.removeEventListener('scroll', handleScroll);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 方式2: 2秒后自动加载（兜底）
    const timer = setTimeout(load, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // 未加载时：完全不渲染任何内容，避免闪白屏
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
