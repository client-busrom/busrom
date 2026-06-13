"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useSeoAriaLabel } from "@/components/product-series/SeoKeywordProvider";

const DESIGN_WIDTH = 1920;

type AnimatedLinkButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark"; // light: 浅色背景用, dark: 深色背景用
  ballColor?: string; // 自定义球体颜色
  style?: React.CSSProperties; // 支持外部样式覆盖
  href?: string; // 链接地址
  wrapText?: boolean; // 是否允许文字折行
};

export function AnimatedLinkButton({
  children,
  className,
  variant = "light",
  ballColor: customBallColor,
  style: externalStyle,
  href,
  wrapText = false,
}: AnimatedLinkButtonProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

  // Responsive defaults using clamp() or simple px for mobile
  const ballSize = isMobile ? "44px" : vw(60);

  const isDark = variant === "dark";
  const ballColor = customBallColor || (isDark ? "#5C5623" : "#ECE8D8");
  const textColorClass = isDark ? "text-[#C7BB5D]" : "text-brand-secondary";

  // 文字缩放逻辑：超出容器时自动缩小
  const [textScale, setTextScale] = useState(1);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (wrapText) {
      setTextScale(1);
      return;
    }
    const span = textRef.current;
    if (!span) return;
    const parent = span.parentElement;
    if (!parent) return;

    const checkOverflow = () => {
      const parentWidth =
        parent.clientWidth - (isMobile ? 40 : parseFloat(vw(64)));
      const textWidth = span.scrollWidth;
      if (textWidth > parentWidth && parentWidth > 0) {
        setTextScale(parentWidth / textWidth);
      } else {
        setTextScale(1);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children, isMobile, wrapText]);

  const content = (
    <>
      {/* 小球 - 使用 CSS animation 实现左右移动 */}
      <div
        className="ball-animated absolute rounded-full z-0 group-hover:!animate-none group-hover:!left-1 group-hover:-translate-y-1/2"
        style={{
          width: ballSize,
          height: ballSize,
          top: "50%",
          backgroundColor: ballColor,
        }}
      />
      <span
        ref={textRef}
        className={`relative z-10 transition-transform duration-300 group-hover:translate-x-1 ${wrapText ? "whitespace-normal break-words" : "whitespace-nowrap"}`}
        style={{
          transform: `scale(${textScale})`,
          transformOrigin: "center left",
          display: "inline-block",
          textAlign: "left",
        }}
      >
        {children}
      </span>
    </>
  );

  const buttonClass = cn(
    "group relative flex items-center justify-center font-anaheim font-medium bg-transparent overflow-visible",
    textColorClass,
    className,
  );

  const buttonStyle = {
    height: ballSize,
    paddingLeft: isMobile ? "24px" : vw(40),
    paddingRight: isMobile ? "16px" : vw(24),
    fontSize: isMobile ? "18px" : vw(32),
    lineHeight: isMobile ? "1.2" : vw(30),
    ...externalStyle,
  };

  const seoAriaLabel = useSeoAriaLabel();

  if (href) {
    return (
      <a href={href} className={buttonClass} style={buttonStyle} aria-label={seoAriaLabel || undefined}>
        {content}
      </a>
    );
  }

  return (
    <button className={buttonClass} style={buttonStyle} aria-label={seoAriaLabel || undefined}>
      {content}
    </button>
  );
}
