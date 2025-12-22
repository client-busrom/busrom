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
 * 懒加载区域包装器
 * 只有当区域接近视口时才渲染子组件，减少初始内存占用
 */
export function LazySection({
  children,
  minHeight = "400px",
  threshold = 200,
  placeholderBg = "transparent",
  headerTheme,
}: LazySectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 如果已经渲染了，不需要再观察
    if (shouldRender) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: `${threshold}px 0px`, // 提前加载
        threshold: 0,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, shouldRender]);

  if (!shouldRender) {
    return (
      <div
        ref={ref}
        data-header-theme={headerTheme}
        style={{
          minHeight,
          background: placeholderBg,
        }}
      />
    );
  }

  return <div data-header-theme={headerTheme}>{children}</div>;
}
