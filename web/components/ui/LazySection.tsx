"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** header 主题，用于滚动时正确显示 header 颜色 */
  headerTheme?: "light" | "dark" | "transparent";
}

/**
 * 懒加载区域包装器（单个模块用）
 * 优化：不再渲染包裹 div，而是通过 React.cloneElement 将 headerTheme 注入给子组件
 * 从而实现 DOM 结构的扁平化
 */
export function LazySection({
  children,
  headerTheme,
}: LazySectionProps) {
  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // @ts-ignore - 注入 headerTheme 属性
          return React.cloneElement(child, { headerTheme });
        }
        return child;
      })}
    </>
  );
}

interface DeferredContentProps {
  children: ReactNode;
}

/**
 * 延迟加载容器（用于首屏之后的所有内容）
 * 用户开始滚动或首屏渲染 2 秒后加载剩余内容
 */
export function DeferredContent({
  children,
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

  if (!shouldRender) {
    return null;
  }

  return <section className="overflow-hidden">{children}</section>;
}
