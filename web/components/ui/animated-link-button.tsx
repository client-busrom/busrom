"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DESIGN_WIDTH = 1920;

type AnimatedLinkButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function AnimatedLinkButton({ children, className }: AnimatedLinkButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [ballLeft, setBallLeft] = useState(4);
  const containerRef = useRef<HTMLButtonElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const ballSize = (60 / DESIGN_WIDTH) * 100; // vw

  // 动画循环 - 使用 setInterval 避免滚动时暂停
  useEffect(() => {
    if (isHovered) {
      // 停止动画，让 CSS transition 过渡回左边
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // 延迟一帧后设置回左边，让浏览器有时间应用 transition
      requestAnimationFrame(() => {
        setBallLeft(4);
      });
      return;
    }

    // 重置开始时间
    startTimeRef.current = Date.now();

    const updatePosition = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const duration = 2500; // 2.5秒一个周期
      const progress = (elapsed % duration) / duration;

      // 使用 ease-in-out 缓动
      const easeInOut = (t: number) => {
        return t < 0.5
          ? 2 * t * t
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
      };

      // 0-0.5: 从左到右, 0.5-1: 从右到左
      let position: number;
      if (progress < 0.5) {
        position = easeInOut(progress * 2);
      } else {
        position = 1 - easeInOut((progress - 0.5) * 2);
      }

      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const ballPx = (ballSize / 100) * window.innerWidth;
        const maxLeft = containerWidth - ballPx - 4;
        const newLeft = 4 + position * maxLeft;
        setBallLeft(newLeft);
      }
    };

    // 每 16ms 更新一次 (约 60fps)
    intervalRef.current = setInterval(updatePosition, 16);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, ballSize]);

  return (
    <Button
      ref={containerRef}
      className={cn(
        "group flex relative items-center justify-center font-anaheim font-medium text-brand-secondary bg-transparent hover:bg-transparent",
        className
      )}
      style={{
        height: `${(60 / DESIGN_WIDTH) * 100}vw`,
        paddingLeft: `${(40 / DESIGN_WIDTH) * 100}vw`,
        paddingRight: `${(24 / DESIGN_WIDTH) * 100}vw`,
        fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
        lineHeight: `${(30 / DESIGN_WIDTH) * 100}vw`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "absolute bg-[#ECE8D8] rounded-full z-0 transition-all duration-500 ease-out",
          isHovered && "scale-[12]"
        )}
        style={{
          width: `${ballSize}vw`,
          height: `${ballSize}vw`,
          top: "50%",
          left: `${ballLeft}px`,
          transform: "translateY(-50%)",
        }}
      />
      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
        {children}
      </span>
    </Button>
  );
}
