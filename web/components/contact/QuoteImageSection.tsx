"use client"

import React, { useState, useRef, useEffect } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"

// 自定义鼠标指针 SVG
const CUSTOM_CURSOR_SVG = (
  <svg width="49" height="66" viewBox="0 0 49 66" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.000295865 4.42946L0.539055 50.4774C0.567373 52.8953 2.57735 54.8327 5.02862 54.8049C6.07898 54.7929 7.09098 54.4139 7.8847 53.7352L19.2422 44.0239L30.8233 63.8102C32.049 65.9042 34.7635 66.6217 36.8864 65.4127L41.7526 62.6414C43.8756 61.4324 44.6029 58.7547 43.3772 56.6607L31.7962 36.8743L46.0112 32.0243C48.3278 31.2339 49.5563 28.7406 48.7549 26.4554C48.412 25.4774 47.729 24.6508 46.827 24.1223L6.70535 0.614656C4.59772 -0.620196 1.87437 0.0640426 0.622412 2.14303C0.206126 2.83436 -0.00911459 3.62542 0.000295865 4.42946Z" fill="#587AFF"/>
  </svg>
)

const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922
const ORIGINAL_CONTENT_HEIGHT = 1083
const CONTENT_SCALE = 0.9
const IMAGE_LEFT = 152
const IMAGE_TOP = 176
const IMAGE_WIDTH = 1604
const IMAGE_HEIGHT = 693
const IMAGE_RADIUS = 346.5

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: any
  cropFocalPoint?: any
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface QuoteImageSectionProps {
  image?: MediaObject | null
  titleLine1?: string
  titleLine2?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
}

export function QuoteImageSection({
  image,
  titleLine1 = "NEED A QUOTE OR",
  titleLine2 = "TECHNICAL SUPPORT",
  subtitle = "Let Us Provide You With A Professional Solution.",
  buttonText = "Get A Solution",
  buttonLink = "#contact-form",
}: QuoteImageSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  // 响应式判断
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !containerRef.current || !cursorRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / CONTENT_SCALE
    const y = (e.clientY - rect.top) / CONTENT_SCALE
    cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  // 移动端渲染逻辑
  if (isMobile) {
    return (
      <section className="relative w-full bg-[#FFF9E8] py-16 px-6 overflow-hidden">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center">
          <h2 className="font-josefin-sans font-bold text-4xl mb-2 text-black">{titleLine1}</h2>
          <h2 className="font-josefin-sans font-bold text-4xl mb-8 text-black">{titleLine2}</h2>
          
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-8 shadow-xl">
            {image ? (
              <OptimizedImage image={image as any} alt="Quote" size="large" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-x-6 bottom-6 text-left">
              <p className="font-josefin-sans font-medium text-white text-lg leading-tight mb-4">{subtitle}</p>
              <Link href={buttonLink} className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-[#FFCC4A]" />
                </div>
                <span className="font-anaheim font-medium text-white text-lg">{buttonText}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 桌面端渲染逻辑 (保持原封不动)
  const title1Left = 130
  const title1Top = 119
  const title1Width = 1659
  const title2Left = 76
  const title2Top = 785
  const title2Width = 1766

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: vw(SECTION_HEIGHT),
        background: "linear-gradient(180deg, #FFF9E8 0%, #F9E9A7 100%)",
      }}
    >
      <div
        className="absolute left-0 w-full"
        style={{
          height: vw(ORIGINAL_CONTENT_HEIGHT),
          top: `calc(50% - ${vw(ORIGINAL_CONTENT_HEIGHT * CONTENT_SCALE / 2)})`,
          transform: `scale(${CONTENT_SCALE})`,
          transformOrigin: "top center",
        }}
      >
        <h2 className="absolute font-josefin-sans font-bold text-center" style={{ left: vw(title1Left), top: vw(title1Top), width: vw(title1Width), fontSize: vw(150), lineHeight: vw(165), color: "#000000" }}>{titleLine1}</h2>
        <h2 className="absolute font-josefin-sans font-bold text-center" style={{ left: vw(title2Left), top: vw(title2Top), width: vw(title2Width), fontSize: vw(150), lineHeight: vw(167), color: "#000000" }}>{titleLine2}</h2>

        <div
          id="qs-cursor-area-v3"
          ref={containerRef}
          className="absolute overflow-hidden"
          onMouseEnter={(e) => {
            setIsVisible(true)
            handleMouseMove(e)
          }}
          onMouseLeave={() => setIsVisible(false)}
          onMouseMove={handleMouseMove}
          style={{
            left: vw(IMAGE_LEFT),
            top: vw(IMAGE_TOP),
            width: vw(IMAGE_WIDTH),
            height: vw(IMAGE_HEIGHT),
            borderRadius: vw(IMAGE_RADIUS),
            cursor: "none",
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            #qs-cursor-area-v3, #qs-cursor-area-v3 *, #qs-cursor-area-v3 a, #qs-cursor-area-v3 img {
              cursor: none !important;
            }
          ` }} />
          
          {image ? (
            image.enableLink && image.linkUrl ? (
              <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} className="block absolute inset-0 w-full h-full" style={{ cursor: "none" }}>
                <OptimizedImage image={image as any} alt="Quote" size="xlarge" className="w-full h-full object-cover" />
              </Link>
            ) : (
              <OptimizedImage image={image as any} alt="Quote" size="xlarge" className="w-full h-full object-cover" />
            )
          ) : (
            <div className="absolute inset-0 bg-gray-600" />
          )}

          <div className="absolute inset-0" style={{ backgroundColor: "rgba(2, 2, 2, 0.29)" }} />

          <h2 className="absolute font-josefin-sans font-bold text-center pointer-events-none" style={{ left: vw(title1Left - IMAGE_LEFT), top: vw(title1Top - IMAGE_TOP), width: vw(title1Width), fontSize: vw(150), lineHeight: vw(165), color: "#F6F4ED" }}>{titleLine1}</h2>
          <h2 className="absolute font-josefin-sans font-bold text-center pointer-events-none" style={{ left: vw(title2Left - IMAGE_LEFT), top: vw(title2Top - IMAGE_TOP), width: vw(title2Width), fontSize: vw(150), lineHeight: vw(167), color: "#F6F4ED" }}>{titleLine2}</h2>
          <p className="absolute font-josefin-sans font-medium text-white pointer-events-none" style={{ left: vw(995 - IMAGE_LEFT), top: vw(489 - IMAGE_TOP), width: vw(412), fontSize: vw(36), lineHeight: vw(47) }}>{subtitle}</p>

          <Link href={buttonLink} className="absolute group transition-opacity hover:opacity-80" style={{ left: vw(1436 - IMAGE_LEFT), top: vw(478 - IMAGE_TOP), cursor: "none" }}>
            <div className="absolute rounded-full border transition-colors group-hover:bg-white/10" style={{ width: vw(104), height: vw(104), borderColor: "white" }}>
              <div className="absolute rounded-full" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: vw(12), height: vw(12), backgroundColor: "#FFCC4A" }} />
            </div>
            <span className="absolute font-anaheim font-medium text-white whitespace-nowrap" style={{ left: vw(70), top: vw(27), fontSize: vw(32), lineHeight: vw(49) }}>{buttonText}</span>
          </Link>

          <div
            ref={cursorRef}
            className="pointer-events-none absolute left-0 top-0 z-[9999] will-change-transform"
            style={{
              display: isVisible ? "block" : "none",
              marginTop: "-2px",
              marginLeft: "-2px",
            }}
          >
            {CUSTOM_CURSOR_SVG}
          </div>
        </div>
      </div>
    </section>
  )
}
