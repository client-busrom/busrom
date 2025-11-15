
import { useEffect, useRef } from "react"
import Image from "next/image"
import gsap from "gsap"

// [修正] 定义一个更详细的数据结构，包含图片源、位置、宽高比和尺寸缩放
const imageDetails = [
  { src: '/1.jpg', position: { top: "50%", left: "50%" }, aspectRatio: '9 / 16', widthScale: 1.0 },   // 1
  { src: '/2.jpg', position: { top: "50%", left: "35%" }, aspectRatio: '9 / 6', widthScale: 1.0 },   // 2
  { src: '/3.jpg', position: { top: "50%", left: "65%" }, aspectRatio: '9 / 12', widthScale: 0.8 },   // 3
  { src: '/4.jpg', position: { top: "75%", left: "50%" }, aspectRatio: '9 / 6', widthScale: 1.0 },   // 4
  { src: '/5.jpg', position: { top: "65%", left: "65%" }, aspectRatio: '9 / 6', widthScale: 1.4 },   // 5
  { src: '/6.jpg', position: { top: "30%", left: "65%" }, aspectRatio: '9 / 6', widthScale: 1.4 },   // 6
  { src: '/7.jpg', position: { top: "25%", left: "40%" }, aspectRatio: '9 / 6', widthScale: 1 },   // 7
];

const BASE_WIDTH = 256; // 设置一个基础宽度（像素），对应 w-64

interface ImageWallProps {
  isActive: boolean; // [新增] 控制动画是否开始
  onComplete: () => void;
}

export function ImageWall({ isActive, onComplete }: ImageWallProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // [修正] 只有在 isActive 为 true 时才执行动画
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

    // [修正] 在动画开始前，立即让容器可见
    gsap.set(container, { opacity: 1, pointerEvents: 'auto' });

    tl.fromTo(
      ".image-item",
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.2,
      }
    )
  }, [isActive, onComplete])

  return (
    <div
      ref={containerRef}
      // [修正] 初始状态下保持透明且不可交互
      className="fixed inset-0 z-40 bg-[#EBE6D8] opacity-0 pointer-events-none"
    >
      {imageDetails.map((item, index) => {
        const width = BASE_WIDTH * item.widthScale;

        return (
          <div
            key={item.src}
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
              sizes={`${width}px`} // 建议为 next/image 添加 sizes 属性
            />
          </div>
        )
      })}
    </div>
  )
}

