import React, { useState, useEffect } from "react"
import { OptimizedImage, OptimizedBackgroundImage } from "@/components/ui/OptimizedImage"
import { motion, AnimatePresence } from "framer-motion"
import { HollowText } from "@/components/common/HollowText"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface BrandPositionItem {
  title: string
  image: MediaObject | null
  link?: string
}

interface MediaObject {
  url: string
  id: string
  alt?: string
  altText?: string
  variants?: any
}

interface StoryBrandPositionSectionProps {
  data: {
    title: string
    subtitle: string
    description: string
    items: {
      slides: BrandPositionItem[]
      autoplay: boolean
      interval: number
    }
    image: any
  }
}

/**
 * CapsuleActiveIndicator
 * Implements the rotating spheres around a pill-shaped track.
 * Path is calculated based on width 291 and height 431.
 */
function CapsuleActiveIndicator() {
  const width = 291
  const height = 431
  const radius = width / 2
  const straightH = height - width // 140 for height 431
  
  // Track parameters for generatePoints
  // topCenterY = radius, bottomCenterY = height - radius
  const topY = radius
  const bottomY = height - radius

  const generatePoints = (startOffset: number) => {
    const xPoints = []
    const yPoints = []
    const steps = 60
    
    for (let i = 0; i <= steps; i++) {
      const p = ((i / steps) * 100 + startOffset) % 100
      let x = 0, y = 0
      
      if (p < 25) { // Top Arc
        const angle = (180 + (p / 25) * 180) * (Math.PI / 180)
        x = radius + radius * Math.cos(angle)
        y = topY + radius * Math.sin(angle)
      } else if (p < 50) { // Right side
        const t = (p - 25) / 25
        x = width
        y = topY + t * straightH
      } else if (p < 75) { // Bottom Arc
        const angle = (0 + (p - 50) / 25 * 180) * (Math.PI / 180)
        x = radius + radius * Math.cos(angle)
        y = bottomY + radius * Math.sin(angle)
      } else { // Left side
        const t = (p - 75) / 25
        x = 0
        y = bottomY - t * straightH
      }
      xPoints.push(x)
      yPoints.push(y)
    }
    return { x: xPoints, y: yPoints }
  }

  const p1 = generatePoints(0)
  const p2 = generatePoints(50) // Opposite side

  return (
    <div 
      className="absolute pointer-events-none"
      style={{ 
        width: vw(width), 
        height: vw(height),
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)"
      }}
    >
      {/* The Capsule Border (Rectangle 451) */}
      <div 
        className="absolute inset-0 border border-[#b1ac7f]"
        style={{ borderRadius: vw(225) }}
      />
      
      {/* Rotating Sphere 1 (Ellipse 114) */}
      <motion.div
        className="absolute rounded-full bg-[#b1ac7f]"
        style={{ width: vw(13), height: vw(13), marginLeft: vw(-6.5), marginTop: vw(-6.5) }}
        animate={{ 
          left: p1.x.map(x => vw(x)),
          top: p1.y.map(y => vw(y))
        }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      />

      {/* Rotating Sphere 2 (Ellipse 113) */}
      <motion.div
        className="absolute rounded-full bg-[#b1ac7f]"
        style={{ width: vw(21), height: vw(21), marginLeft: vw(-10.5), marginTop: vw(-10.5) }}
        animate={{ 
          left: p2.x.map(x => vw(x)),
          top: p2.y.map(y => vw(y))
        }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      />
    </div>
  )
}

export function StoryBrandPositionSection({ data }: StoryBrandPositionSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-play Logic
  useEffect(() => {
    const { autoplay, interval, slides } = data.items
    if (!autoplay || isPaused || slides.length === 0) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, interval)

    return () => clearInterval(timer)
  }, [data.items, isPaused])

  return (
    <section 
      className="relative w-full"
      style={{ 
        height: vw(1105), 
        backgroundColor: "#f2efd8" 
      }}
    >
      {/* Decorative Rotating/Orbiting Group (vnWA6 + MdA83) */}
      <div 
        className="absolute pointer-events-none"
        style={{ 
          left: vw(1308), 
          top: vw(744),
          width: vw(408),
          height: vw(168),
          zIndex: 1
        }}
      >
        {/* The Ellipse Border */}
        <div 
          className="absolute inset-0 border border-[#C9C177]" 
          style={{ 
            borderRadius: "50%",
            transform: "rotate(-22.02deg)",
          }}
        />

        {/* Orbiting Star */}
        <motion.div
          className="absolute"
          style={{ 
            width: vw(38), 
            height: vw(38),
            marginLeft: vw(-19),
            marginTop: vw(-19),
            zIndex: 3
          }}
          animate={{ 
            left: Array.from({ length: 61 }).map((_, i) => {
              const t = (i / 60) * 2 * Math.PI
              const a = 204 // 408/2
              const b = 84 // 168/2
              const rot = -22.02 * (Math.PI / 180)
              const x = a * Math.cos(t) * Math.cos(rot) - b * Math.sin(t) * Math.sin(rot)
              return vw(204 + x)
            }),
            top: Array.from({ length: 61 }).map((_, i) => {
              const t = (i / 60) * 2 * Math.PI
              const a = 204
              const b = 84
              const rot = -22.02 * (Math.PI / 180)
              const y = a * Math.cos(t) * Math.sin(rot) + b * Math.sin(t) * Math.cos(rot)
              return vw(84 + y)
            }),
            rotate: 360
          }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity 
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
             <path 
               d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z" 
               fill="#C9C177" 
             />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto overflow-visible">
        
        {/* 1. Split-Color Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="absolute z-20 font-josefin-sans font-bold flex items-baseline"
          style={{ 
            left: vw(148), 
            top: vw(-72),
            lineHeight: 1
          }}
        >
          {data.title.split(" ").map((word, idx) => {
            if (idx === 0) {
              return (
                <div 
                  key={idx} 
                  className="relative inline-block mr-8"
                  style={{ fontSize: vw(143), width: "max-content" }}
                >
                  <div className="absolute text-white overflow-hidden" style={{ height: "50%", width: "max-content", top: 0 }}>{word}</div>
                  <div className="absolute text-[#756f3f] overflow-hidden" style={{ height: "50%", bottom: 0, width: "max-content" }}>
                    <div style={{ transform: "translateY(-50%)" }}>{word}</div>
                  </div>
                  <div className="opacity-0">{word}</div>
                </div>
              )
            }
            return (
              <span key={idx} className="text-[#756f3f] font-josefin-sans tracking-tight" style={{ fontSize: vw(48), marginLeft: vw(24) }}>
                {word.toUpperCase()}
              </span>
            )
          })}
        </motion.div>

        {/* 2. Carousel Items Area */}
        <div 
          className="absolute" 
          style={{ left: vw(0), right: vw(0), top: vw(40), height: vw(500) }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative w-full h-full flex justify-center items-end" style={{ gap: vw(20) }}>
            {data.items.slides.map((item, i) => {
              const isActive = i === activeIndex
              
              return (
                <div
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="relative flex flex-col items-center flex-shrink-0 cursor-pointer"
                  style={{ width: vw(322) }} 
                >
                  {/* Indicator goes behind item but centered */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute z-0"
                        style={{ top: "40%", transform: "translateY(-50%)" }}
                      >
                        <CapsuleActiveIndicator />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Oval Card Container */}
                  <div 
                    className="relative z-10 overflow-hidden bg-[#d9d9d9] border border-black/5"
                    style={{ 
                      width: isActive ? vw(247) : vw(219),
                      height: isActive ? vw(334) : vw(296),
                      borderRadius: isActive ? vw(123.5) : vw(109.5),
                      boxShadow: isActive ? "0 9px 15px rgba(0,0,0,0.4)" : "none",
                    }}
                  >
                    <OptimizedImage
                      image={item.image}
                      size="small"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Text Label */}
                  <div 
                    className={`mt-10 font-bold font-josefin-sans text-center transition-all duration-300`}
                    style={{ 
                      fontSize: isActive ? vw(32) : vw(24),
                      color: "#000000",
                      width: vw(322),
                      lineHeight: 1.1
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3. Bottom Philosophy Graphic */}
        <div className="absolute" style={{ left: vw(160), top: vw(602), width: vw(709), height: vw(433) }}>
          <div className="absolute inset-0 border border-[#b1ac7f]" style={{ borderRadius: vw(216.5) }} />
          <div className="absolute overflow-hidden" style={{ left: vw(63), top: vw(22), width: vw(709), height: vw(389), borderRadius: vw(194.5) }}>
            <OptimizedImage image={data.image} alt="Philosophy image" size="medium" className="object-cover" />
          </div>
        </div>

        <div className="absolute font-josefin-sans font-bold" style={{ left: vw(811), top: vw(679), width: vw(887), height: vw(162) }}>
          <div className="absolute left-0 top-0 z-10">
            <HollowText strokeWidth={1} strokeColor="#524d20" className="leading-none" style={{ fontSize: vw(128) }}>
              {data.subtitle.split(" ")[0]}
            </HollowText>
          </div>
          <div className="absolute z-0" style={{ left: vw(193), top: vw(54) }}>
            <span className="leading-none text-[#524d20]" style={{ fontSize: vw(128) }}>
              {data.subtitle.split(" ").slice(1).join(" ")}
            </span>
          </div>
        </div>

        <div 
          className="absolute font-josefin-sans text-left"
          style={{ 
            left: vw(1012), 
            top: vw(869),
            width: vw(664),
            fontSize: vw(32),
            lineHeight: 1.4,
            color: "#6b6744"
          }}
        >
          {data.description}
        </div>
      </div>
    </section>
  )
}
