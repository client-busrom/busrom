"use client";

import { cn } from "@/lib/utils";

const DESIGN_WIDTH = 1920;

type AnimatedLinkButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function AnimatedLinkButton({ children, className }: AnimatedLinkButtonProps) {
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;
  const ballSize = vw(60);

  return (
    <button
      className={cn(
        "group relative flex items-center justify-center font-anaheim font-medium text-brand-secondary bg-transparent overflow-visible",
        className
      )}
      style={{
        height: ballSize,
        paddingLeft: vw(40),
        paddingRight: vw(24),
        fontSize: vw(32),
        lineHeight: vw(30),
      }}
    >
      {/* 小球 - 使用 CSS animation 实现左右移动 */}
      <div
        className="ball-animated absolute rounded-full bg-[#ECE8D8] z-0 group-hover:!animate-none group-hover:!left-1 group-hover:-translate-y-1/2"
        style={{
          width: ballSize,
          height: ballSize,
          top: "50%",
        }}
      />
      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
        {children}
      </span>
    </button>
  );
}
