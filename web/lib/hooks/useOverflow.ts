import { useState, useEffect, useRef, type RefObject } from "react";

export function useOverflow<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  isOverflow: boolean;
} {
  const ref = useRef<T | null>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const naturalHeight = el.scrollHeight;

      const maxH = parseFloat(getComputedStyle(el).maxHeight);
      const hasMaxHeight = !isNaN(maxH) && maxH > 0;

      if (hasMaxHeight) {
        // Add 5px tolerance for subpixel rendering and font metrics bleeding
        setIsOverflow(naturalHeight > maxH + 5);
      } else {
        setIsOverflow(false);
      }
    };

    // 初始检测
    check();

    // ResizeObserver 监听元素大小变化
    const ro = new ResizeObserver(check);
    ro.observe(el);

    // 字体加载后重新检测
    document.fonts.ready.then(() => {
      // 延迟确保布局稳定
      setTimeout(check, 100);
    });

    // 额外延迟检测，确保所有资源加载完成
    const timer = setTimeout(check, 500);

    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return { ref, isOverflow };
}
