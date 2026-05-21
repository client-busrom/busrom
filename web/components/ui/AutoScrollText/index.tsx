"use client";

import React, { useRef, useEffect, useState } from "react";

interface AutoScrollTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AutoScrollText
 *
 * 文本太长时自动水平滚动（marquee 效果）。
 * 文本较短时不滚动。
 */
export const AutoScrollText: React.FC<AutoScrollTextProps> = ({
  text,
  className,
  style,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const textEl = textRef.current;
    const container = containerRef.current;
    if (!textEl || !container) return;

    const check = () => {
      const overflow = textEl.scrollWidth - container.clientWidth;
      if (overflow > 0) {
        setShouldScroll(true);
        setScrollDistance(overflow);
      } else {
        setShouldScroll(false);
        setScrollDistance(0);
      }
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    ro.observe(textEl);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden"
      style={{ whiteSpace: "nowrap" }}
    >
      <span
        ref={textRef}
        className={`inline-block ${className || ""}`}
        style={{
          ...style,
          animation: shouldScroll
            ? `autoScrollText 6s ease-in-out infinite alternate`
            : undefined,
          // @ts-ignore
          "--scroll-distance": `-${scrollDistance}px`,
        }}
      >
        {text}
      </span>
      <style>{`
        @keyframes autoScrollText {
          0%, 25% { transform: translateX(0); }
          75%, 100% { transform: translateX(var(--scroll-distance)); }
        }
      `}</style>
    </div>
  );
};

export default AutoScrollText;
