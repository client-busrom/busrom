"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface MagneticProps {
  children: React.ReactElement;
  strength?: number; // 磁吸强度 (0-1)
  className?: string;
}

export default function Magnetic({ children, strength = 0.5, className }: MagneticProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // 物理参数：吸附力度与平滑度
    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      
      // 计算鼠标相对于中心点的位移
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const distanceX = clientX - centerX;
      const distanceY = clientY - centerY;

      // 应用磁吸强度
      xTo(distanceX * strength);
      yTo(distanceY * strength);
    };

    const handleMouseLeave = () => {
      // 鼠标离开，回到原位
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  // 使用 React.cloneElement 保持子元素的结构
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
