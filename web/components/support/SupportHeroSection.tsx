"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

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
  
  // Title mask geometry from node CCWjq in support.pen
  const titleMaskPath = "M460 106c0 37.55536 30.44464 68 68 68l78 0c37.55536 0 68-30.44464 68-68l0-38c0-37.55536 30.44464-68 68-68l689 0c37.5554 0 68 30.44464 68 68l0 51c0 37.55536-30.4446 68-68 68l-28 0c-37.5553 0-68 30.44464-68 68l0 25c0 37.55536-30.4446 68-68 68l-195 0c-37.5553 0-68-30.44464-68-68l0-38c0-37.55536-30.44464-68-68-68l-28 0c-37.55536 0-68 30.44464-68 68l0 38c0 37.55536-30.44464 68-68 68l-464 0c-37.55536 0-68-30.44464-68-68l0-38c0-37.55536-30.44464-68-68-68l-103.99999 0c-37.55536 0-68.00001-30.44464-68.00001-68l0-38c0-37.55536 30.44464-68 68-68l324 0c37.55536 0 68 30.44464 68 68l0 38z"
  
  // Image clip-path geometry from node aeXKe in support.pen
  const imageClipPath = "M412.49023 0c25.40494 0 45.99976 20.59512 46 46l0 119.7998c0 9.37833 7.60312 16.98145 16.98145 16.98145 9.37793-0.00026 16.98019-7.60254 16.98047-16.98047l0-66.80078c0.00024-25.40488 20.59503-46 46-46l62.71777 0c25.40497 0 45.99976 20.59512 46 46l0 57.36621c0 14.36072 11.45984 26.04469 25.7334 26.40625l1.36328 0.01758c14.27344 0.36154 25.73316 12.04574 25.7334 26.40625l0 116.5791c0 25.40509-20.59491 46-46 46l-49.0498 0c-21.49067 0-38.91285 17.42246-38.91309 38.91309-0.00024 21.4906-17.42242 38.91211-38.91309 38.91211l-37.31347 0c-21.46564-0.00028-38.86692-17.40155-38.86719-38.86719-0.00024-21.46564-17.40155-38.86789-38.86719-38.86817l-25.28418 0 0 0.00098-31.08105 0c-11.20609 0.039-21.29288 4.82187-28.36231 12.44336-0.58514 2.10483-0.92776 4.56458-0.93359 7.44043l0 23.44629c0 8.06406-3.67136 15.27106-9.43359 20.04004l0 14.36426-0.00098-0.00098 0-14.36231c-4.49823 3.72236-10.27069 5.95899-16.56543 5.95899l-104.60352 0c-14.35939-0.00003-26-11.6406-26-26l0-160.19434c0.00034-14.35911 11.64081-26 26-26l98.41797 0c-6.82226-4.0041-14.76684-6.30273-23.24902-6.30273l-60.83008 0c-25.40494 0-45.99976 20.59512-46 46l0 19.34961c0 25.40509-20.59491 46-46 46l-72.15039 0c-25.4051 0-46-20.59491-46-46l0-242.04883c0.00025-25.40488 20.59506-46 46-46l366.49023 0z"

  const renderTitleContent = (color: string) => {
    // Find special node (bold formatting identifies the decorative element)
    const specialNode = data.title.find((n: any) => n.format === 1)
    const specialText = specialNode ? (specialNode.text || "").toString() : ""

    return (
      <div 
        className="relative w-full h-full text-left font-kaushan-script"
        style={{ 
          fontSize: vw(110), 
          lineHeight: TITLE_CONFIG.lineHeight, 
          color,
          paddingTop: vw(TITLE_CONFIG.containerPaddingTop),
          paddingLeft: vw(TITLE_CONFIG.containerPaddingLeft),
          whiteSpace: "pre-wrap" // Respect manual line breaks and spaces from CMS
        }}
      >
        {/* Special Character Box layer (Absolute) */}
        {specialText && (
          <motion.div 
            className="absolute z-10 flex items-center justify-center"
            initial={{ x: "-50%", y: 0 }}
            animate={{ y: [0, -15, 0] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            style={{ 
              left: `calc(50% + ${vw(TITLE_CONFIG.ampersandX)})`, 
              top: vw(TITLE_CONFIG.ampersandY),
              width: vw(233), 
              height: vw(277)
            }}
          >
            <div 
              className="w-full h-full" 
              style={{ 
                borderRadius: vw(68),
                backgroundColor: color === "#ffffff" ? "rgba(255, 255, 255, 0.9)" : "#d3cc94"
              }} 
            />
            
            {/* Shimmering Text Container */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ borderRadius: vw(68) }}>
              <motion.span 
                className="absolute font-kavivanar" 
                style={{ 
                  fontSize: vw(200), 
                  lineHeight: 0.73,
                  marginTop: vw(TITLE_CONFIG.ampersandTextMarginTop),
                  color: color === "#ffffff" ? "#ffffff" : "#000000",
                  // Shimmer Effect via Background Clip
                  backgroundImage: color === "#ffffff" 
                    ? "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 70%)"
                    : "linear-gradient(120deg, rgba(0,0,0,0) 30%, rgba(255,255,255,0.6) 50%, rgba(0,0,0,0) 70%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
                animate={{ 
                  backgroundPosition: ["200% 0", "-200% 0"]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatDelay: 1
                }}
              >
                {specialText}
              </motion.span>
              
              {/* Fallback base text (so text is still visible under the shimmer) */}
              <span 
                className="absolute font-kavivanar pointer-events-none" 
                style={{ 
                  fontSize: vw(200), 
                  lineHeight: 0.73,
                  marginTop: vw(TITLE_CONFIG.ampersandTextMarginTop),
                  color: color === "#ffffff" ? "#ffffff" : "#000000",
                  zIndex: -1
                }}
              >
                {specialText}
              </span>
            </div>
          </motion.div>
        )}

        {/* Inline Text Layer (Skipped bold nodes) */}
        {data.title.map((node: any, i: number) => {
          if (node.type === "linebreak") return <br key={i} />
          if (node.format === 1) return null // Handled in special character box
          return <span key={i}>{node.text}</span>
        })}
      </div>
    )
  }

  const maskSvg = `<svg width="1499" height="348" viewBox="0 0 1499 348" xmlns="http://www.w3.org/2000/svg"><path d="${titleMaskPath}" fill="black"/></svg>`
  const maskUrl = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`

  return (
    <section 
      className="relative w-full bg-[#f6f4ed] z-30" 
      style={{ height: vw(1380) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        
        {/* 1. Hero Title Triple Layer */}
        <div className="relative z-20 flex justify-center w-full select-none" style={{ paddingTop: vw(130) }}>
          <div className="relative" style={{ width: vw(1580), height: vw(348) }}>
            
            {/* Layer 1: Base Black Text */}
            <div className="absolute inset-0 z-0">
              {renderTitleContent("#000000")}
            </div>
            
            {/* Layer 2: Colored Mask Shape */}
            <svg 
              className="absolute inset-0 z-1 w-full h-full pointer-events-none" 
              viewBox="0 0 1499 348" 
              fill="none"
            >
              <path d={titleMaskPath} fill="#574f0e" />
            </svg>

            {/* Layer 3: Masked White Text */}
            <div 
              className="absolute inset-0 z-2"
              style={{ 
                WebkitMaskImage: maskUrl,
                maskImage: maskUrl,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%"
              }}
            >
              {renderTitleContent("#ffffff")}
            </div>
          </div>
        </div>

        {/* 2. Hero Tips */}
        <div className="absolute z-20 select-none" style={{ left: vw(1181), top: vw(160), width: vw(507) }}>
          <p 
            className="font-kaushan-script text-[#fff49f] leading-loose text-left whitespace-pre-wrap" 
            style={{ fontSize: vw(36), letterSpacing: vw(2.16) }}
          >
            {data.tips}
          </p>
        </div>

        {/* 3. Hero Subtitle */}
        <div className="absolute z-20 w-full flex justify-center select-none" style={{ top: vw(503) }}>
          <div className="relative flex items-center justify-center" style={{ width: vw(977), height: vw(174) }}>
            {/* Subtitle Background SVG */}
            <svg 
              className="absolute inset-0 w-full h-full" 
              viewBox="0 0 977 174" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M977 50.5c0 27.89038-22.60962 50.5-50.5 50.5l-237 0c-20.15839 0-36.5 16.34161-36.5 36.5 0 20.15839-16.34161 36.5-36.5 36.5l-558.50001 0c-32.03252 0-57.99999-25.96748-57.99999-58l0-58c0-32.03252 25.96749-58 58-58l868.5 0c27.89038 0 50.5 22.60962 50.5 50.5z" fill="#ede8c2" />
            </svg>
            
            {/* Subtitle Text */}
            <p 
              className="relative z-10 font-kaushan-script text-[#464010] leading-[1.37] px-10 text-left whitespace-pre-wrap" 
              style={{ fontSize: vw(46) }}
            >
              {data.subtitle}
            </p>
          </div>
        </div>

        {/* 4. Hero Image */}
        {(() => {
          const imageMaskSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='450' viewBox='0 0 700 450'><path d='${imageClipPath}' fill='black'/></svg>`
          const imgMaskUrl = `url("data:image/svg+xml,${encodeURIComponent(imageMaskSvg)}")`
          
          return (
            <div 
              className="absolute z-10 overflow-hidden" 
              style={{ 
                left: vw(159), 
                top: vw(822), 
                width: vw(700), 
                height: vw(450),
                WebkitMaskImage: imgMaskUrl,
                maskImage: imgMaskUrl,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                backgroundColor: "#ede8c2" // Background fallback to see the shape if image fails
              }}
            >
              <OptimizedImage 
                image={data.image || "/BusromFooterBg_original.webp"} 
                alt="Support Hero" 
                className="object-cover w-full h-full"
                size="large"
                priority
              />
            </div>
          )
        })()}

        {/* 5. CTA Section */}
        <motion.div 
          className="absolute z-20 border border-[#756f3f] bg-[#f6f4ed] shadow-lg" 
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : vw(450)
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ 
            right: vw(159), 
            top: vw(822), 
            width: vw(834),
            borderRadius: vw(70),
            padding: `${vw(67)} ${vw(52)}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div className="relative flex flex-col h-full flex-1">
            <h2 className="font-montserrat font-bold text-black" style={{ fontSize: vw(46), lineHeight: 1.24, marginBottom: vw(16) }}>
              {data.cta.title}
            </h2>
            
            {/* 内部高度容器：使用 motion 处理内容显示 */}
            <motion.div 
              style={{ fontSize: vw(24), lineHeight: 1.5 }}
              animate={{ height: isExpanded ? 'auto' : vw(72) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`font-montserrat text-[#756f3f] mt-4 overflow-hidden ${!isExpanded ? 'line-clamp-2' : ''}`}
            >
              {data.cta.content}
            </motion.div>

            {/* Spacer to push button down */}
            <div className="mt-8 flex-1" />

            <div className="flex justify-end relative" style={{ minHeight: vw(71) }}>
              <motion.button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group overflow-visible relative flex items-center justify-end"
                  animate={{ 
                    width: isExpanded ? vw(71) : vw(260)
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ 
                    height: vw(71) 
                  }}
              >
                  {/* Capsule Background */}
                  <div 
                    className="absolute inset-0 bg-[#756f3f] group-hover:scale-[1.02] transition-transform duration-300" 
                    style={{ borderRadius: vw(35.5) }} 
                  />
                  
                  {/* Button Content Container */}
                  <div 
                    className="relative z-10 flex items-center w-full h-full" 
                    style={{ 
                      paddingLeft: isExpanded ? 0 : vw(51), 
                      paddingRight: isExpanded ? 0 : vw(6), // 靠近边缘创造圆环效果
                      justifyContent: isExpanded ? 'center' : 'space-between' 
                    }}
                  >
                    <motion.span 
                      initial={false}
                      animate={{ 
                        opacity: isExpanded ? 0 : 1,
                        x: isExpanded ? -20 : 0,
                        width: isExpanded ? 0 : 'auto',
                        visibility: isExpanded ? 'hidden' : 'visible'
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="font-josefin-sans font-medium text-white whitespace-nowrap overflow-hidden" 
                      style={{ 
                        fontSize: vw(20),
                        marginRight: isExpanded ? 0 : vw(15) // 当非展开时，给予间距
                      }}
                    >
                      {data.cta.buttonText || "LEARN MORE"}
                    </motion.span>
 
                    {/* Circular Icon (White circle) - Flex-shrink-0 to prevent distortion */}
                    <div 
                      className="flex-shrink-0 bg-white rounded-full flex items-center justify-center transition-transform duration-300"
                      style={{ 
                        width: vw(58.4), 
                        height: vw(58.4),
                      }}
                    >
                      <svg 
                        className="transition-transform duration-500"
                        style={{ 
                          width: vw(36), 
                          height: vw(36),
                          transform: isExpanded ? 'rotate(-135deg)' : 'rotate(0deg)'
                        }} 
                        viewBox="0 0 58 58" fill="none"
                      >
                        <path d="M35.6242 19.3948l-0.0244 0.0029-11.334 1.6201c-0.7421 0.1061-1.2572 0.7932-1.1504 1.5352l0.0039 0.0225c0.1174 0.7299 0.7986 1.2337 1.5332 1.1289l8.3076-1.1875-10.9756 14.6543c-0.3748 0.5004-0.2723 1.2107 0.2285 1.5859l0.127 0.0947c0.5 0.3618 1.2001 0.258 1.5713-0.2373l10.9756-14.6543 1.1972 8.3057c0.1069 0.742 0.795 1.2574 1.5371 1.1514 0.7419-0.1061 1.257-0.7934 1.1504-1.5352l-1.6338-11.333-0.0039-0.0244c-0.0129-0.0791-0.033-0.1568-0.0596-0.2324l-0.0058-0.0156c-0.0697-0.2315-0.2117-0.4344-0.4053-0.5791L36.3 19.6104l-0.0137-0.0107c-0.186-0.1352-0.4088-0.2106-0.6386-0.2158l-0.0098 0c-0.0881-0.0062-0.177-0.0031-0.2647 0.0078z" fill="#756f3f" />
                      </svg>
                    </div>
                  </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
