import { useEffect, useRef } from "react"
import Image from "next/image"
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

  useEffect(() => {
    // 只有在 isActive 为 true 时才执行动画
    if (!isActive) return;

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

    tl.fromTo(
      ".image-item",
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: duration,
        ease: "power2.out",
        stagger: stagger,
      }
    )
  }, [isActive, onComplete, duration, stagger])

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
            <Image
              src={item.src}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover"
              sizes={`${width}px`}
              priority // All images load with priority since this is the loading screen
            />
          </div>
        )
      })}
    </div>
  )
}
