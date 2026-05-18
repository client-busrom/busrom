"use client"

import React, { useState, useRef, useMemo, Fragment, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface CustomizedItem {
  id: string
  title: string
  description?: string
  image?: {
    url: string
    alt?: string
  }
}

interface SupportCustomizedSectionProps {
  title: any[]
  product: {
    title: string
    items: CustomizedItem[]
  }
  manufacturing: {
    title: string
    items: CustomizedItem[]
  }
}

function renderNodes(nodes: any[], vw: (px: number) => string, context: "title" | "subtitle" = "title", isDesktop: boolean = true): React.ReactNode {
  let globalIndex = 0
  const renderRecursive = (nodeList: any[]): React.ReactNode[] => {
    if (!nodeList || !Array.isArray(nodeList)) return []
    return nodeList.map((node) => {
      globalIndex++
      if (node.type === "linebreak") return <br key={globalIndex} />
      if (node.children) return <Fragment key={globalIndex}>{renderRecursive(node.children)}</Fragment>
      if (node.text !== undefined) {
        const isBoldValue = (node.format & 1) !== 0
        const isUnderline = (node.format & 8) !== 0
        let style: React.CSSProperties = {}
        if (context === "title") {
          if (isDesktop) {
            style.fontSize = vw(40)
            style.fontWeight = "normal"
            if (isUnderline) {
              style.color = "#817931"; style.fontWeight = "bold"; style.fontSize = vw(54)
            } else if (isBoldValue) {
              style.color = "#5E5616"; style.fontWeight = "bold"; style.fontSize = vw(54)
            }
          } else {
            style.fontSize = "1.5rem"
            style.fontWeight = "normal"
            if (isUnderline) {
              style.color = "#817931"; style.fontWeight = "bold"; style.fontSize = "1.75rem"
            } else if (isBoldValue) {
              style.color = "#5E5616"; style.fontWeight = "bold"; style.fontSize = "1.75rem"
            }
          }
        }
        return <span key={globalIndex} style={style}>{node.text}</span>
      }
      return null
    })
  }
  return renderRecursive(nodes)
}

function CollapsedTitleCard({ title, vw }: { title: string, vw: (px: number) => string }) {
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const wordSpans = Array.from(containerRef.current.querySelectorAll('.word-measure')) as HTMLSpanElement[]
    if (wordSpans.length === 0) return

    // Collect all rendered client rects (handles words split across lines by word-break)
    const allRects: DOMRect[] = []
    wordSpans.forEach(span => {
      const rects = Array.from(span.getClientRects())
      allRects.push(...rects)
    })

    if (allRects.length === 0) return

    // Group rects by visual line using vertical position (rounded to nearest 5px)
    const lines: { [key: number]: DOMRect[] } = {}
    allRects.forEach(rect => {
      const lineKey = Math.round(rect.top / 5) * 5
      if (!lines[lineKey]) lines[lineKey] = []
      lines[lineKey].push(rect)
    })

    let maxLineWidth = 0
    Object.values(lines).forEach(rects => {
      if (rects.length === 0) return
      const left = Math.min(...rects.map(r => r.left))
      const right = Math.max(...rects.map(r => r.right))
      const lineWidth = right - left
      if (lineWidth > maxLineWidth) {
        maxLineWidth = lineWidth
      }
    })

    const viewportWidth = Math.min(window.innerWidth, 1920)
    const currentVwWidth = (maxLineWidth / viewportWidth) * 1920
    
    const clampedWidth = Math.max(154, Math.min(200, currentVwWidth))
    setMeasuredWidth(clampedWidth)
  }, [title])

  return (
    <div 
      ref={containerRef} 
      className="text-[#f8f6e5] font-montserrat font-bold whitespace-pre-wrap text-left" 
      style={{ 
        width: measuredWidth ? vw(measuredWidth) : vw(200), 
        minWidth: vw(154),
        maxWidth: vw(200),
        wordBreak: "break-word", 
        WebkitTextStroke: "1px #000000", 
        paintOrder: "stroke fill",
      }}
    >
      {title.split(/\s+/).map((word, i) => (
        <React.Fragment key={i}>
          <span className="word-measure">{word}</span>
          {" "}
        </React.Fragment>
      ))}
    </div>
  )
}

export function SupportCustomizedSection({ title, product, manufacturing }: SupportCustomizedSectionProps) {
  const [activeGroup, setActiveGroup] = useState<"product" | "manufacturing">("product")
  const activeData = activeGroup === "product" ? product : manufacturing
  const items = activeData.items
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverToggle, setHoverToggle] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  
  const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handleToggleGroup = () => {
    setActiveGroup(prev => prev === "product" ? "manufacturing" : "product")
    setActiveIndex(0)
  }

  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <Fragment key={i}>
        {line.replace(/ /g, "\u00A0")}
        <br />
      </Fragment>
    ))
  }

  const CustomToggleIcon = ({ direction = "right", isHovered = false }: { direction?: "left" | "right", isHovered?: boolean }) => {
    const mainColor = "#756f3f"
    return (
      <svg 
        width="60" height="60" viewBox="0 0 60 60" fill="none" 
        className="transition-transform duration-500"
        style={{ transform: direction === "left" ? "rotate(180deg)" : "rotate(0deg)" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="30" cy="30" r="28" fill={isHovered ? mainColor : "transparent"} stroke={mainColor} strokeWidth="1.5" className="transition-all duration-300" />
        <path 
          d="M23.2549 20.7188l9.7406 9.6975-9.7406 9.6975 1.6602 1.6934 11.5852-11.4523-11.5859-11.4529-1.6595 1.6934z" 
          fill={isHovered ? "#ffffff" : mainColor} 
          className="transition-colors duration-300"
        />
      </svg>
    )
  }

  const InactiveSubtractSVG = () => (
    <svg width="100%" height="100%" viewBox="0 0 298 386" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M59 178c0 7.1797 5.8203 13 13 13 7.1797 0 13-5.8203 13-13l0-148c0-16.56854 13.43146-30 30-30l153 0c16.56854 0 30 13.43146 30 30l0 326c0 16.56854-13.43146 30-30 30l-153 0c-16.56854 0-30-13.43146-30-30l0-138c0-7.1797-5.8203-13-13-13-7.1797 0-13 5.8203-13 13l0 138.5c0 16.29239-13.2076 29.5-29.5 29.5-16.2924 0-29.5-13.20761-29.5-29.5l0-326.99999c0-16.2924 13.2076-29.50001 29.5-29.50001 16.2924 0 29.5 13.2076 29.5 29.5l0 148.5z" fill="#EBE5B4"/>
    </svg>
  )

  const ActiveSubtractSVG = () => (
    <svg width="100%" height="100%" viewBox="0 0 608 386" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="activeGradient" x1="304" y1="0" x2="304" y2="386" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#F1ECC8" /><stop offset="100%" stopColor="#F9DC7A" /></linearGradient></defs>
      <path d="M59 252c0 7.17972 5.8203 13 13 13 7.1797 0 13-5.82031 13-13l0-222.00001c0-16.56854 13.43146-29.99999 30-29.99999l463 0c16.56854 0 30 13.43146 30 30l0 326c0 16.56854-13.43146 30-30 30l-463.00001 0c-16.56854 0-29.99999-13.43146-29.99999-30l0-60c0-7.17969-5.8203-13-13-13-7.1797 0-13 5.82031-13 13l0 60.5c0 16.29239-13.2076 29.5-29.5 29.5-16.2924 0-29.5-13.20761-29.5-29.5l0-326.99999c0-16.2924 13.2076-29.50001 29.5-29.50001 16.2924 0 29.5 13.2076 29.5 29.5l0 222.5z" fill="url(#activeGradient)"/>
    </svg>
  )

  const scrollTranslateX = useMemo(() => {
    if (items.length <= 3) return 0
    if (items.length === 4) {
      if (activeIndex < 2) return 0
      return 438 / 19.2
    }
    return Math.max(0, activeIndex - 1) * (413 + 32) / 19.2
  }, [items.length, activeIndex])

  const containerRef = useRef<HTMLDivElement>(null)

  if (!isDesktop) {
    return (
      <section className="relative bg-[#f6f4ed] py-20 px-6 overflow-hidden">
        {/* Background Bubbles */}
        <motion.div animate={{ y: [0, -40, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute rounded-full blur-[10px] opacity-40" style={{ left: '-10%', top: '5%', width: '150px', height: '150px', backgroundColor: "#e9e19e75" }} />
        <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute rounded-full blur-[10px] opacity-40" style={{ right: '-5%', top: '40%', width: '100px', height: '100px', backgroundColor: "#fff5a8c7" }} />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-12 text-center">
            <h2 className="font-montserrat text-black" style={{ lineHeight: 1.5 }}>
              {Array.isArray(title) ? renderNodes(title, vw, "title", false) : title}
            </h2>
            <div className="flex gap-4 w-full justify-center">
              <button 
                  onClick={() => { setActiveGroup("product"); setActiveIndex(0); }}
                  className={`flex-1 max-w-[160px] py-4 rounded-full font-montserrat font-bold text-xs transition-all ${activeGroup === "product" ? "bg-[#262203] text-white shadow-lg" : "bg-white text-[#262203] border border-[#262203]"}`}
              >
                PRODUCT
              </button>
              <button 
                  onClick={() => { setActiveGroup("manufacturing"); setActiveIndex(0); }}
                  className={`flex-1 max-w-[160px] py-4 rounded-full font-montserrat font-bold text-xs transition-all ${activeGroup === "manufacturing" ? "bg-[#262203] text-white shadow-lg" : "bg-white text-[#262203] border border-[#262203]"}`}
              >
                MANUFACTURING
              </button>
            </div>
          </div>

          {/* Vertical Card List */}
          <div className="flex flex-col gap-10">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative bg-white rounded-[30px] p-6 shadow-lg border border-[#26220308]"
              >
                <div className="flex flex-col gap-6">
                  {/* Image */}
                  <div className="w-full h-[220px] flex-shrink-0 overflow-hidden rounded-2xl relative shadow-inner">
                    {item.image && (
                      <OptimizedImage 
                        image={item.image.url} 
                        alt={item.image.alt || ""} 
                        className="object-cover w-full h-full" 
                        size="small"
                      />
                    )}
                    {!item.image && <div className="w-full h-full bg-[#d9d9d9]" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-2">
                    <h4 className="font-montserrat font-bold text-[#262203] text-xl mb-3 leading-tight">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="font-montserrat font-light text-[#4a4a4a] text-base leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-[#f6f4ed]" style={{ height: vw(1220), paddingTop: vw(120) }}>
      <motion.div animate={{ y: [0, -80, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute rounded-full blur-[10px]" style={{ left: vw(96), top: vw(-237), width: vw(682), height: vw(682), backgroundColor: "#e9e19e75", zIndex: 1 }} />
      <motion.div animate={{ y: [0, 60, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute rounded-full blur-[10px]" style={{ left: vw(1657), top: vw(95), width: vw(131), height: vw(131), backgroundColor: "#fff5a8c7", zIndex: 1 }} />
      <motion.div animate={{ y: [0, -60, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute rounded-full blur-[10px]" style={{ left: vw(1319), top: vw(258), width: vw(281), height: vw(281), backgroundColor: "#fff5a8c7", zIndex: 1 }} />

      <div className="relative z-10 mx-auto w-full px-[10vw]">
        <h2 className="text-center font-montserrat text-[#000000] mx-auto whitespace-pre-wrap" style={{ fontSize: vw(48), lineHeight: 1.6, width: vw(1500) }}>
          {renderNodes(title, vw, "title", true)}
        </h2>
      </div>

      <div className="relative mt-[8vw] z-10 w-full overflow-hidden">
        {/* Full-width dynamic mirrored bar */}
        <div className="w-full relative flex" style={{ paddingLeft: vw(131), paddingRight: vw(131), marginBottom: vw(84) }}>
          <motion.div 
            layout
            className={`flex items-center w-full ${activeGroup === "manufacturing" ? "flex-row-reverse justify-start" : "flex-row justify-start"}`}
          >
            <motion.h3 
                key={activeGroup}
                className={`font-josefin-sans font-bold text-[#524d20] ${activeGroup === "manufacturing" ? "text-right" : "text-left"}`}
                style={{ fontSize: vw(60), lineHeight: 1.1, paddingTop: vw(10), width: "fit-content", maxWidth: vw(900) }}
            >
                {renderFormattedText(activeData.title)}
            </motion.h3>
            
            <button 
                onClick={handleToggleGroup} 
                onMouseEnter={() => setHoverToggle(true)}
                onMouseLeave={() => setHoverToggle(false)}
                className={`${activeGroup === "manufacturing" ? "mr-[1.8vw]" : "ml-[1.8vw]"} cursor-pointer transition-transform hover:scale-125 active:scale-95 flex-shrink-0`}
                style={{ width: vw(60), height: vw(60) }}
            >
                <CustomToggleIcon direction={activeGroup === "product" ? "right" : "left"} isHovered={hoverToggle} />
            </button>
          </motion.div>
        </div>

        <div 
          ref={containerRef}
          className="flex transition-transform duration-500 ease-out pb-[5vw]"
          style={{ paddingLeft: vw(150), gap: vw(32), transform: `translateX(-${scrollTranslateX}vw)` }}
        >
          {items.map((item, idx) => {
            const isActive = idx === activeIndex

            return (
              <motion.div 
                key={item.id} 
                onClick={() => setActiveIndex(idx)} 
                layout 
                animate={{ y: isActive ? -30 : 0 }}
                className="relative flex-shrink-0 cursor-pointer" 
                style={{ width: isActive ? vw(723) : vw(420), height: vw(428) }}
              >
                <motion.div layout className="z-[10] absolute left-0 top-0 overflow-hidden" style={{ width: vw(176), height: vw(426), borderRadius: vw(30) }}>
                  {item.image && (
                    <OptimizedImage 
                      image={item.image.url} 
                      alt={item.image.alt || ""} 
                      className={`object-cover w-full h-full transition-all duration-700 ${isActive ? "" : "grayscale"}`} 
                      size="large"
                    />
                  )}
                  {!item.image && <div className="w-full h-full bg-[#d9d9d9]" />}
                </motion.div>
                <motion.div layout className="absolute" style={{ left: vw(115), top: vw(42), width: isActive ? vw(608) : vw(310), height: vw(386) }}>
                  {isActive ? <ActiveSubtractSVG /> : <InactiveSubtractSVG />}
                </motion.div>
                <div className="absolute z-10 w-full h-full pointer-events-none">
                  <motion.h4 
                    layout="position" 
                    className="absolute font-montserrat font-bold overflow-hidden whitespace-pre-wrap flex" 
                    style={{ 
                      fontSize: isActive ? vw(29) : vw(24), 
                      color: isActive ? "#000000" : "transparent", 
                      left: isActive ? vw(243) : vw(204), 
                      top: isActive ? vw(81) : (item.title.length > 15 ? vw(100) : vw(121)), 
                      width: isActive ? vw(400) : vw(221), 
                      justifyContent: isActive ? "flex-start" : "center",
                      textAlign: "left",
                      lineHeight: isActive ? 1.28 : vw(46) 
                    }}
                  >
                    {!isActive ? (
                      <CollapsedTitleCard title={item.title} vw={vw} />
                    ) : item.title}
                  </motion.h4>
                  {isActive && item.description && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute font-montserrat font-light text-[#000000] whitespace-pre-wrap" style={{ fontSize: vw(20), lineHeight: 1.4, left: vw(243), top: vw(225), width: vw(450) }}>{item.description}</motion.p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
