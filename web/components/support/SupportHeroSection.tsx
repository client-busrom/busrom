"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { IconifyIcon } from "@/components/ui/IconifyIcon"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

// --- POSITIONING CONFIGURATION (Adjust these to fine-tune layout) ---
const TITLE_CONFIG = {
  containerPaddingTop: 10,    // Vertical offset for the entire 2-line title
  containerPaddingLeft: 60,   // Horizontal offset to shift text right
  ampersandX: -650,           // Horizontal offset from center for the special box (bold character)
  ampersandY: 200,            // Vertical offset for the special box
  ampersandTextMarginTop: 10, // Vertical offset for character inside the box
  textSegmentMarginX: 30,      // Horizontal margin between regular text segments
  lineHeight: 1.4            // Overall line height for the title
}

interface RichTextNode {
  text?: string
  format?: number
  type?: string
  children?: RichTextNode[]
}

interface SupportHeroSectionProps {
  data: {
    title: RichTextNode[]
    tips: string
    subtitle: string
    cta: {
      title: string
      content: string
      buttonText: string
    }
    image: {
      url: string
      id: string
    } | null
  }
}

export function SupportHeroSection({ data }: SupportHeroSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  // Title mask geometry from node CCWjq in support.pen
  const titleMaskPath = "M460 106c0 37.55536 30.44464 68 68 68l78 0c37.55536 0 68-30.44464 68-68l0-38c0-37.55536 30.44464-68 68-68l689 0c37.5554 0 68 30.44464 68 68l0 51c0 37.55536-30.4446 68-68 68l-28 0c-37.5553 0-68 30.44464-68 68l0 25c0 37.55536-30.4446 68-68 68l-195 0c-37.5553 0-68-30.44464-68-68l0-38c0-37.55536-30.44464-68-68-68l-28 0c-37.55536 0-68 30.44464-68 68l0 38c0 37.55536-30.44464 68-68 68l-464 0c-37.55536 0-68-30.44464-68-68l0-38c0-37.55536-30.44464-68-68-68l-103.99999 0c-37.55536 0-68.00001-30.44464-68.00001-68l0-38c0-37.55536 30.44464-68 68-68l324 0c37.55536 0 68 30.44464 68 68l0 38z"

  // Image clip-path geometry from node aeXKe in support.pen
  const imageClipPath = "M412.49023 0c25.40494 0 45.99976 20.59512 46 46l0 119.7998c0 9.37833 7.60312 16.98145 16.98145 16.98145 9.37793-0.00026 16.98019-7.60254 16.98047-16.98047l0-66.80078c0.00024-25.40488 20.59503-46 46-46l62.71777 0c25.40497 0 45.99976 20.59512 46 46l0 57.36621c0 14.36072 11.45984 26.04469 25.7334 26.40625l1.36328 0.01758c14.27344 0.36154 25.73316 12.04574 25.7334 26.40625l0 116.5791c0 25.40509-20.59491 46-46 46l-49.0498 0c-21.49067 0-38.91285 17.42246-38.91309 38.91309-0.00024 21.4906-17.42242 38.91211-38.91309 38.91211l-37.31347 0c-21.46564-0.00028-38.86692-17.40155-38.86719-38.86719-0.00024-21.46564-17.40155-38.86789-38.86719-38.86817l-25.28418 0 0 0.00098-31.08105 0c-11.20609 0.039-21.29288 4.82187-28.36231 12.44336-0.58514 2.10483-0.92776 4.56458-0.93359 7.44043l0 23.44629c0 8.06406-3.67136 15.27106-9.43359 20.04004l0 14.36426-0.00098-0.00098 0-14.36231c-4.49823 3.72236-10.27069 5.95899-16.56543 5.95899l-104.60352 0c-14.35939-0.00003-26-11.6406-26-26l0-160.19434c0.00034-14.35911 11.64081-26 26-26l98.41797 0c-6.82226-4.0041-14.76684-6.30273-23.24902-6.30273l-60.83008 0c-25.40494 0-45.99976 20.59512-46 46l0 19.34961c0 25.40509-20.59491 46-46 46l-72.15039 0c-25.4051 0-46-20.59491-46-46l0-242.04883c0.00025-25.40488 20.59506-46 46-46l366.49023 0z"

  const renderTitleContent = (color: string) => {
    const specialNode = data.title.find((n: any) => n.format === 1)
    const specialText = specialNode ? (specialNode.text || "").toString() : ""

    return (
      <div
        className="relative w-full h-full text-left font-kaushan-script whitespace-pre-wrap"
        style={{
          fontSize: vw(110), // Base font size
          lineHeight: vw(154),
          color,
          paddingTop: vw(TITLE_CONFIG.containerPaddingTop),
          paddingLeft: vw(TITLE_CONFIG.containerPaddingLeft),
        }}
      >
        {(() => {
          let currentLine = 0;
          return data.title.map((node: any, i: number) => {
            if (node.type === "linebreak") {
              currentLine++;
              return <br key={i} />
            }
            if (node.format === 1) return null

            const size = locale === "en" ? vw(110) : (currentLine === 0 ? vw(110) : vw(90));
            const wrapClass = currentLine > 0 ? "whitespace-pre" : "";
            return <span key={i} className={wrapClass} style={{ fontSize: size }}>{node.text}</span>
          });
        })()}
      </div>
    )
  }

  const maskSvg = `<svg width="1499" height="348" viewBox="0 0 1499 348" xmlns="http://www.w3.org/2000/svg"><path d="${titleMaskPath}" fill="black"/></svg>`
  const maskUrl = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`

  return (
    <section className="relative w-full bg-[#f6f4ed] z-30 min-h-screen md:h-[calc(1380*min(100vw,1920px)/1920)]">
      {/* --- DESKTOP & TABLET VIEW (md and above) --- */}
      <div className="hidden md:block relative w-full h-full max-w-[1920px] mx-auto ">
        {/* 1. Hero Title Triple Layer */}
        <div className="relative z-20 flex justify-center w-full select-none" style={{ paddingTop: vw(130) }}>
          <div className="relative" style={{ width: vw(1580), height: vw(348) }}>
            {/* Special Character Box */}
            {(() => {
              const specialNode = data.title.find((n: any) => n.format === 1)
              const specialText = specialNode ? (specialNode.text || "").toString() : ""
              if (!specialText) return null

              return (
                <motion.div
                  className="absolute z-30 flex items-center justify-center"
                  initial={{ x: "-50%", y: 0 }}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    left: `calc(50% + ${vw(TITLE_CONFIG.ampersandX)})`,
                    top: vw(TITLE_CONFIG.ampersandY),
                    width: vw(233),
                    height: vw(277)
                  }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 233 277" fill="none">
                      <rect x="0" y="0" width="233" height="277" rx="58" ry="58" fill="#ede8c2" />
                    </svg>
                    <motion.span
                      className="relative font-bold select-none font-kavivanar"
                      style={{
                        fontSize: vw(200),
                        lineHeight: 1,
                        marginTop: vw(TITLE_CONFIG.ampersandTextMarginTop),
                        color: "transparent",
                        backgroundImage: "linear-gradient(120deg, rgba(255,255,255,0) 25%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 75%)",
                        backgroundSize: "200% 100%",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        zIndex: 1
                      }}
                      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      {specialText}
                    </motion.span>
                  </div>
                </motion.div>
              )
            })()}

            <div className="absolute inset-0 z-0">{renderTitleContent("#000000")}</div>
            <svg className="absolute inset-0 z-1 w-full h-full pointer-events-none" viewBox="0 0 1499 348" fill="none">
              <path d={titleMaskPath} fill="#574f0e" />
            </svg>
            <div className="absolute inset-0 z-2" style={{ WebkitMaskImage: maskUrl, maskImage: maskUrl, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
              {renderTitleContent("#ffffff")}
            </div>
          </div>
        </div>

        {/* 2. Hero Tips */}
        <div className="absolute z-20 select-none" style={{ right: vw(230), top: vw(160), width: vw(580) }}>
          <p className="font-kaushan-script text-[#fff49f] leading-loose text-right" style={{ fontSize: vw(36), letterSpacing: vw(2.16), marginRight: vw(20), textWrap: 'balance' }}>
            {data.tips.replace(/\n/g, ' ')}
          </p>
        </div>

        <div className="absolute z-20 w-full flex justify-center select-none" style={{ top: vw(503) }}>
          <div className="relative flex items-center justify-center" style={{ width: vw(1024), height: vw(174) }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 977 174" preserveAspectRatio="none" fill="none">
              <path d="M977 50.5c0 27.89038-22.60962 50.5-50.5 50.5l-237 0c-20.15839 0-36.5 16.34161-36.5 36.5 0 20.15839-16.34161 36.5-36.5 36.5l-558.50001 0c-32.03252 0-57.99999-25.96748-57.99999-58l0-58c0-32.03252 25.96749-58 58-58l868.5 0c27.89038 0 50.5 22.60962 50.5 50.5z" fill="#ede8c2" />
            </svg>
            <p
              className={`relative z-10 font-kaushan-script text-[#464010] leading-[1.37] text-left ${locale === "en" ? "whitespace-pre-wrap" : "whitespace-normal"}`}
              style={{
                fontSize: vw(46),
                width: locale === "en" ? "auto" : vw(960)
              }}
            >
              {locale === "en" ? data.subtitle : data.subtitle.replace(/\n/g, ' ')}
            </p>
          </div>
        </div>

        {/* 4. Hero Image */}
        {(() => {
          const imageMaskSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='450' viewBox='0 0 700 450'><path d='${imageClipPath}' fill='black'/></svg>`
          const imgMaskUrl = `url("data:image/svg+xml,${encodeURIComponent(imageMaskSvg)}")`
          return (
            <motion.div
              className="absolute z-10 overflow-hidden"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ left: vw(159), top: vw(822), width: vw(700), height: vw(450), WebkitMaskImage: imgMaskUrl, maskImage: imgMaskUrl, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskSize: "100% 100%", maskSize: "100% 100%", backgroundColor: "#ede8c2" }}
            >
              <OptimizedImage image={data.image || "/BusromFooterBg_original.webp"} alt="Support Hero" className="object-cover w-full h-full" size="large" priority />
            </motion.div>
          )
        })()}

        {/* 5. CTA Section */}
        <motion.div
          className="absolute z-20 border border-[#756f3f] bg-[#f6f4ed] shadow-lg"
          animate={{ height: isExpanded ? vw(530) : vw(450) }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ right: vw(159), top: vw(822), width: vw(834), borderRadius: vw(70), padding: `${vw(67)} ${vw(52)}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <div className="relative flex flex-col h-full flex-1">
            <h2 className="font-montserrat font-bold text-black" style={{ fontSize: vw(46), lineHeight: 1.24, marginBottom: vw(16) }}>{data.cta.title}</h2>
            <motion.div 
              lang={locale}
              data-lenis-prevent="true"
              style={{ 
                fontSize: vw(24), 
                lineHeight: 1.5,
                textAlign: "justify",
                textJustify: "inter-word",
                hyphens: "auto",
                WebkitHyphens: "auto",
                overflowY: isExpanded ? "auto" : "hidden",
                scrollbarWidth: isExpanded ? "thin" : "none",
                scrollbarColor: "rgba(117, 111, 63, 0.3) transparent",
                paddingRight: isExpanded ? "4px" : "0",
                overscrollBehavior: "contain"
              }} 
              animate={{ height: isExpanded ? vw(160) : vw(80) }} 
              transition={{ duration: 0.5, ease: "easeInOut" }} 
              className={`font-montserrat text-[#756f3f] font-medium mt-2 ${!isExpanded ? 'line-clamp-2' : ''}`}
            >
              {data.cta.content}
            </motion.div>
            <div className="mt-0 flex-1" />
            <div className="flex justify-end relative" style={{ minHeight: vw(71) }}>
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group overflow-visible relative flex items-center justify-end"
                animate={{ width: isExpanded ? vw(71) : vw(260), rotate: isExpanded ? 0 : [0, -2, 2, -2, 2, 0] }}
                whileHover={{ scale: 1.05, rotate: 0 }}
                transition={{ width: { duration: 0.5, ease: "easeInOut" }, rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }, scale: { duration: 0.2 } }}
                style={{ height: vw(71), transformOrigin: "center center" }}
              >
                <div className="absolute inset-0 bg-[#756f3f] group-hover:bg-white border border-[#756f3f] transition-all duration-300" style={{ borderRadius: vw(35.5) }} />
                <div className="relative z-10 flex items-center w-full h-full" style={{ paddingLeft: isExpanded ? 0 : vw(51), paddingRight: isExpanded ? 0 : vw(6), justifyContent: isExpanded ? 'center' : 'space-between' }}>
                  <motion.span animate={{ opacity: isExpanded ? 0 : 1, x: isExpanded ? -20 : 0, width: isExpanded ? 0 : 'auto', visibility: isExpanded ? 'hidden' : 'visible' }} className="font-josefin-sans font-medium text-white group-hover:text-[#756f3f] transition-colors duration-300 whitespace-nowrap overflow-hidden" style={{ fontSize: vw(20), marginRight: isExpanded ? 0 : vw(15) }}>
                    {data.cta.buttonText || "LEARN MORE"}
                  </motion.span>
                  <div className="flex-shrink-0 bg-white group-hover:bg-[#756f3f] text-[#756f3f] group-hover:text-white rounded-full flex items-center justify-center transition-all duration-300" style={{ width: vw(58.4), height: vw(58.4) }}>
                    <IconifyIcon name={isExpanded ? "ph:arrow-up" : "ph:arrow-up-right"} className="transition-transform duration-500" size={vw(28)} />
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MOBILE VIEW (Below md) --- */}
      <div className="md:hidden flex flex-col items-center mt-12 text-center space-y-10" style={{ padding: `${vw(40)} ${vw(40)}` }}>
        {/* Mobile Title */}
        <h1 className="font-kaushan-script text-[#574f0e] text-4xl sm:text-5xl leading-tight">
          {data.title.map((node: any, i: number) => (
            <span key={i} className={node.format === 1 ? "text-[#756f3f] italic" : ""}>
              {node.text}
              {node.type === "linebreak" && <br />}
            </span>
          ))}
        </h1>

        {/* Mobile Tips */}
        <p className="font-kaushan-script text-[#756f3f] text-xl opacity-80 max-w-sm">
          {data.tips}
        </p>

        {/* Mobile Image */}
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
          <OptimizedImage
            image={data.image || "/BusromFooterBg_original.webp"}
            alt="Support Hero"
            className="object-cover w-full h-full"
            size="medium"
          />
        </div>

        {/* Mobile Subtitle */}
        <p className="font-kaushan-script text-[#464010] text-2xl leading-relaxed bg-[#ede8c2] p-6 rounded-2xl shadow-inner max-w-md">
          {data.subtitle}
        </p>

        {/* Mobile CTA */}
        <div className="w-full bg-[#f6f4ed] border border-[#756f3f] rounded-[40px] p-8 shadow-lg text-center">
          <h2 className="font-montserrat font-bold text-2xl text-black mb-4">{data.cta.title}</h2>
          <p className="font-montserrat text-[#756f3f] text-lg leading-relaxed mb-0">
            {data.cta.content}
          </p>
        </div>
      </div>
    </section>
  )
}
