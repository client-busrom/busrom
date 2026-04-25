import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import type { ImageWallItem } from "@/lib/api/preloader-config"

const BASE_WIDTH = 256; // 设置一个基础宽度（像素），对应 w-64

interface ImageWallProps {
  isActive: boolean;
  onComplete: () => void;
  images: ImageWallItem[];
  backgroundColor?: string;
  duration?: number;
  stagger?: number;
}

export function ImageWall({
  isActive,
  onComplete,
  images,
  backgroundColor = "#EBE6D8",
  duration = 0.8,
  stagger = 0.2,
}: ImageWallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadedCount, setLoadedCount] = useState(0)
  const [allImagesReady, setAllImagesReady] = useState(false)

  // 当所有图片加载完成时标记为 ready
  // 如果没有图片，直接标记为 ready
  useEffect(() => {
    if (images.length === 0) {
      setAllImagesReady(true)
    } else if (loadedCount >= images.length) {
      setAllImagesReady(true)
    }
  }, [loadedCount, images.length])

  // 处理图片加载完成或失败
  const handleImageLoad = () => {
    setLoadedCount(prev => prev + 1)
  }

  // 图片加载失败也计入已加载数量，避免卡住
  const handleImageError = () => {
    setLoadedCount(prev => prev + 1)
  }

  const hasStarted = useRef(false)

  useEffect(() => {
    // 1. 基础条件检查
    if (!isActive || !allImagesReady || hasStarted.current) return;

    const container = containerRef.current
    if (!container) return

    // 2. 标记为已启动，防止重复触发
    hasStarted.current = true;

    // 3. 使用 GSAP Context 进行安全管理
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // 4. 关键改进：淡出开始时就通知外部“加载已完成”
          // 这样父组件会立刻切换到 done 状态，避免状态滞留导致的重复触发
          onComplete();

          gsap.to(container, {
            opacity: 0,
            duration: 1,
            pointerEvents: 'none',
            ease: "power2.inOut",
          })
        },
      })

      // 初始设置
      gsap.set(container, { opacity: 1, pointerEvents: 'auto' });

      // 执行图片弹出动画
      tl.fromTo(
        ".image-item",
        {
          scale: 0,
          opacity: 0,
          willChange: "transform, opacity"
        },
        {
          scale: 1,
          opacity: 1,
          duration: duration,
          ease: "power2.out",
          stagger: stagger,
          force3D: true,
          onComplete: () => {
            gsap.set(".image-item", { willChange: "auto" });
          }
        }
      )
    }, containerRef);

    return () => ctx.revert(); // 清理动画
  }, [isActive, allImagesReady, onComplete, duration, stagger])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-40 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        backgroundColor,
      }}
    >
      {images.map((item, index) => {
        const width = BASE_WIDTH * item.widthScale;

        return (
          <div
            key={`${item.src}-${index}`}
            className="image-item absolute overflow-hidden shadow-lg -translate-x-1/2 -translate-y-1/2"
            style={{
              top: item.position.top,
              left: item.position.left,
              width: `${width}px`,
              aspectRatio: item.aspectRatio,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={`Gallery image ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        )
      })}
    </div>
  )
}
