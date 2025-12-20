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
  useEffect(() => {
    if (loadedCount >= images.length && images.length > 0) {
      setAllImagesReady(true)
    }
  }, [loadedCount, images.length])

  // 处理图片加载完成
  const handleImageLoad = () => {
    setLoadedCount(prev => prev + 1)
  }

  useEffect(() => {
    // 只有在 isActive 为 true 且所有图片都已加载时才执行动画
    if (!isActive || !allImagesReady) return;

    const container = containerRef.current
    if (!container) return

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(container, {
          opacity: 0,
          duration: 1,
          onComplete: onComplete,
        })
      },
    })

    // 在动画开始前，立即让容器可见
    gsap.set(container, { opacity: 1, pointerEvents: 'auto' });

    // 使用 transform 而不是 scale，启用硬件加速
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
        force3D: true, // 强制使用 GPU 加速
        onComplete: () => {
          // 动画结束后移除 will-change 以释放资源
          gsap.set(".image-item", { willChange: "auto" });
        }
      }
    )
  }, [isActive, allImagesReady, onComplete, duration, stagger])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 opacity-0 pointer-events-none"
      style={{ backgroundColor }}
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
            />
          </div>
        )
      })}
    </div>
  )
}
