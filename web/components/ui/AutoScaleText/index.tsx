"use client";

import React, { useRef, useEffect, useState } from "react";

interface AutoScaleTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** 最小缩放比例，默认 0.5 */
  minScale?: number;
}

/**
 * AutoScaleText
 *
 * 根据父容器宽度自动缩小文本，防止溢出。
 * 使用 ResizeObserver 监听容器变化，首次挂载和尺寸变化时重新计算。
 */
export const AutoScaleText: React.FC<AutoScaleTextProps> = ({
  children,
  className,
  style,
  minScale = 0.5,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    const measure = () => {
      // 重置 transform 以获取真实文本宽度
      el.style.transform = "scale(1)";
      // 强制回流
      void el.offsetWidth;
      const textWidth = el.scrollWidth;
      const containerWidth = parent.clientWidth;

      if (textWidth > containerWidth && containerWidth > 0) {
        setScale(Math.max(minScale, containerWidth / textWidth));
      } else {
        setScale(1);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [children, minScale]);

  return (
    <span
      ref={textRef}
      className={className}
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        transform: `scale(${scale})`,
        transformOrigin: "left center",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default AutoScaleText;
