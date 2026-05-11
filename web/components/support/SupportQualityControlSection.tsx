"use client"
import React, { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface QCItem {
  id: string
  title: string
  description?: string
  buttonText?: string
  image?: {
    url: string
    alt?: string
  }
}

interface SupportQualityControlSectionProps {
  title: any[]
  items: QCItem[]
}

function renderNodes(nodes: any[], vw: (px: number) => string, context: "title" | "subtitle" = "title", isDesktop: boolean = true): React.ReactNode {
  let globalIndex = 0
  const renderRecursive = (nodeList: any[]): React.ReactNode[] => {
    if (!nodeList || !Array.isArray(nodeList)) return []
    return nodeList.map((node) => {
      globalIndex++
      if (node.type === "linebreak") return <br key={globalIndex} />
      if (node.children) return <React.Fragment key={globalIndex}>{renderRecursive(node.children)}</React.Fragment>
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

export function SupportQualityControlSection({ title, items }: SupportQualityControlSectionProps) {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isDesktop, setIsDesktop] = useState(true)
  
  const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`
  const vwn = (px: number) => px * (typeof window !== 'undefined' ? Math.min(window.innerWidth, 1920) / 1920 : 1)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const dragX = useMotionValue(0)
  const x = useSpring(dragX, { stiffness: 300, damping: 30 })

  const gap = vwn(32)
  const inactiveWidth = vwn(457)
  const activeWidth = vwn(849)

  // Dynamically calculate the track width and item positions
  const trackInfo = useMemo(() => {
    let currentX = 0
    const positions: number[] = []
    items.forEach((_, idx) => {
      positions.push(-currentX)
      const isExpanded = expandedIndices.includes(idx)
      currentX += (isExpanded ? activeWidth : inactiveWidth) + gap
    })
    return { positions, totalWidth: currentX - gap }
  }, [expandedIndices, items, activeWidth, inactiveWidth, gap])

  const toggleExpand = (idx: number) => {
    if (expandedIndices.includes(idx)) {
      setExpandedIndices(expandedIndices.filter(i => i !== idx))
    } else {
      setExpandedIndices([...expandedIndices, idx])
    }
  }

  const onDragEnd = (event: any, info: any) => {
    const currentX = dragX.get()
    const velocity = info.velocity.x
    
    // Find the nearest position to snap to
    let nearestIdx = 0
    let minDistance = Math.abs(currentX - trackInfo.positions[0])
    
    trackInfo.positions.forEach((pos, idx) => {
      const distance = Math.abs(currentX - pos)
      if (distance < minDistance) {
        minDistance = distance
        nearestIdx = idx
      }
    })

    // Handle velocity for swipe feel
    if (velocity < -500 && nearestIdx < items.length - 1) {
        nearestIdx++
    } else if (velocity > 500 && nearestIdx > 0) {
        nearestIdx--
    }

    dragX.set(trackInfo.positions[nearestIdx])
  }

  if (!isDesktop) {
    return (
      <section className="bg-[#f6f4ed] py-20 px-6 overflow-hidden">
        <div className="mb-12">
            <h2 className="font-josefin-sans leading-tight text-center">
                {renderNodes(title, vw, "title", false)}
            </h2>
        </div>
        <div className="flex flex-col gap-8">
            {items.map((item) => (
                <div key={item.id} className="bg-[#f6ebc5] rounded-[30px] p-6 shadow-sm">
                    <div className="w-full h-[240px] rounded-2xl overflow-hidden mb-6">
                        {item.image && <OptimizedImage image={item.image.url} alt={item.title || ""} className="w-full h-full object-cover" size="small" />}
                    </div>
                    <h4 className="font-montserrat font-bold text-2xl mb-3">{item.title}</h4>
                    <p className="font-montserrat font-light text-base text-[#5E5616] leading-relaxed opacity-80">{item.description}</p>
                </div>
            ))}
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#f6f4ed] py-[8vw] overflow-hidden">
        <div className="px-[10vw] mb-[5vw]">
            <h2 className="font-josefin-sans leading-tight whitespace-pre-wrap">
                {renderNodes(title, vw, "title", true)}
            </h2>
        </div>

        <div className="relative w-full overflow-visible">
            <motion.div 
              drag="x"
              dragConstraints={{ left: -trackInfo.totalWidth + vwn(600), right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
              className="flex items-start cursor-grab active:cursor-grabbing"
              style={{ paddingLeft: vw(150), gap: vw(32), x }}
            >
                {items.map((item, idx) => {
                    const isExpanded = expandedIndices.includes(idx)
                    const isHovered = hoveredIndex === idx
                    
                    return (
                        <motion.div
                          key={item.id}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => toggleExpand(idx)}
                          className="relative flex-shrink-0 overflow-hidden"
                          animate={{ width: isExpanded ? vw(849) : vw(457) }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          style={{ height: vw(465), borderRadius: vw(50), backgroundColor: "#f6ebc5" }}
                        >
                            <motion.div className="absolute inset-0 flex flex-col pointer-events-none" animate={{ opacity: isExpanded ? 0 : 1 }}>
                                <div className="p-[2vw] pl-[3.1vw] pt-[2vw]">
                                    <h4 className="font-montserrat font-bold whitespace-pre-wrap" 
                                        style={{ 
                                            fontSize: vw(29), 
                                            lineHeight: 1.3, 
                                            width: vw(320),
                                            color: "#f6f4ed",
                                            WebkitTextStroke: "1px #000000",
                                            paintOrder: "stroke fill"
                                        }}
                                    >
                                        {item.title}
                                    </h4>
                                </div>
                                <div className="mt-auto relative w-full" style={{ height: vw(224) }}>
                                    {/* Decorative Circles */}
                                    <div className="absolute" style={{ left: vw(-60), bottom: vw(-60), width: vw(400), height: vw(400) }}>
                                        {/* Rotating Wrapper for Small Circle - Desynchronized by idx */}
                                        <motion.div 
                                            initial={{ rotate: idx * 45 }}
                                            animate={{ rotate: idx * 45 + 360 }}
                                            transition={{ duration: 12 + (idx % 3) * 5, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 origin-center"
                                        >
                                            {/* Small Circle (Ellipse 134) */}
                                            <div className="absolute rounded-full border border-black/5" style={{ left: vw(300), top: vw(80), width: vw(100), height: vw(100), backgroundColor: "#fbf2d3" }} />
                                        </motion.div>
                                        
                                        {/* Large Circle (Ellipse 133) - Top Layer with Shadow */}
                                        <div className="absolute rounded-full border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]" style={{ left: 0, bottom: 0, width: vw(320), height: vw(320), backgroundColor: "#fff6d4" }} />
                                    </div>

                                    <AnimatePresence>
                                        {!isExpanded && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0"
                                            >
                                                <div className="absolute" style={{ left: vw(40), bottom: vw(60) }}>
                                                    <span className="font-montserrat text-[#000000] font-medium transition-colors duration-300" 
                                                          style={{ fontSize: vw(24), color: isHovered ? "#756f3f" : "#000000" }}>
                                                        {item.buttonText || "Read More"}
                                                    </span>
                                                </div>
                                                <motion.div 
                                                    className="absolute flex items-center justify-center rounded-full shadow-sm cursor-pointer"
                                                    style={{ right: vw(40), bottom: vw(40), width: vw(80), height: vw(80) }}
                                                    animate={{ 
                                                        backgroundColor: isHovered ? "#756f3f" : "#ffffff",
                                                        scale: isHovered ? 1.2 : 1
                                                    }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                >
                                                    <svg width="40%" height="40%" viewBox="0 0 32 33" fill="none">
                                                        <motion.path 
                                                            d="M10 23L22 11M22 11H12M22 11V21" 
                                                            animate={{ stroke: isHovered ? "#ffffff" : "#464010" }}
                                                            strokeWidth="3" 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                        />
                                                    </svg>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {isExpanded && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 p-[2.5vw] flex items-center justify-between"
                                    >
                                        <div className="flex flex-col" style={{ width: vw(400), gap: vw(20) }}>
                                            <h4 className="font-montserrat font-bold text-[#000000] whitespace-pre-wrap" style={{ fontSize: vw(29), lineHeight: 1.25 }}>
                                                {item.title}
                                            </h4>
                                            <p className="font-montserrat font-light text-[#5c4c15] whitespace-pre-wrap" style={{ fontSize: vw(20), lineHeight: 1.4 }}>
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="relative flex-shrink-0" style={{ width: vw(300), height: vw(350) }}>
                                            <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg">
                                                {item.image && (
                                                    <OptimizedImage 
                                                        image={item.image.url} 
                                                        alt={item.title}
                                                        size="medium"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    </section>
  )
}
