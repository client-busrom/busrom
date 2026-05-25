"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import type { ImageWallItem } from "@/lib/api/preloader-config"

// Predefined layout from design specification (image-wall.pen)
const LAYOUT_CLASSES = [
  // Layer 1
  "left-[44px] top-[197px] w-[166px] h-[110px] md:left-[32px] md:top-[290px] md:w-[280px] md:h-[187px] lg:left-[44px] lg:top-[369px] lg:w-[300px] lg:h-[200px]",
  // Layer 2
  "left-[56px] top-[336px] w-[154px] h-[103px] md:left-[133px] md:top-[521px] md:w-[262px] md:h-[174px] lg:left-[211px] lg:top-[616px] lg:w-[279px] lg:h-[186px]",
  // Layer 3
  "left-[179px] top-[271px] w-[195px] h-[130px] md:left-[446px] md:top-[126px] md:w-[287px] md:h-[192px] lg:left-[673px] lg:top-[203px] lg:w-[291px] lg:h-[194px]",
  // Layer 4
  "left-[150px] top-[11px] w-[170px] h-[114px] md:left-[467px] md:top-[243px] md:w-[134px] md:h-[179px] lg:left-[565px] lg:top-[313px] lg:w-[158px] lg:h-[211px]",
  // Layer 5
  "left-[252px] top-[102px] w-[96px] h-[128px] md:left-[335px] md:top-[446px] md:w-[327px] md:h-[218px] lg:left-[644px] lg:top-[453px] lg:w-[350px] lg:h-[233px]",
  // Layer 6
  "left-[19px] top-[66px] w-[176px] h-[117px] md:left-[114px] md:top-[77px] md:w-[299px] md:h-[199px] lg:left-[224px] lg:top-[154px] lg:w-[351px] lg:h-[234px]",
  // Layer 7
  "left-[127px] top-[78px] w-[135px] h-[239px] md:left-[292px] md:top-[201px] md:w-[206px] md:h-[365px] lg:left-[366px] lg:top-[279px] lg:w-[248px] lg:h-[441px]"
];

interface ImageWallProps {
  isActive: boolean;
  onComplete: () => void;
  images: (ImageWallItem | null)[];
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

  // Use up to 7 images matching the layout slots
  const displayImages = images.slice(0, 7);
  const activeImagesCount = displayImages.filter(item => item !== null).length;

  // 当所有图片加载完成时标记为 ready
  // 如果没有图片，直接标记为 ready
  useEffect(() => {
    if (activeImagesCount === 0) {
      setAllImagesReady(true)
    } else if (loadedCount >= activeImagesCount) {
      setAllImagesReady(true)
    }
  }, [loadedCount, activeImagesCount])

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
      className={`fixed inset-0 z-40 pointer-events-none flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        backgroundColor,
      }}
    >
      <div className="relative w-[390px] h-[460px] md:w-[768px] md:h-[768px] lg:w-[1024px] lg:h-[968px]">
        {displayImages.map((item, index) => {
          if (!item) return null;

          return (
            <div
              key={`${item.src}-${index}`}
              className={`image-item absolute overflow-hidden shadow-lg opacity-0 scale-0 origin-center ${LAYOUT_CLASSES[index]}`}
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
    </div>
  )
}

