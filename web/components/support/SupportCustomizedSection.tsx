"use client"

import React, { useState, useRef, useMemo, Fragment } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

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

function renderNodes(nodes: any[], vw: (px: number) => string, context: "title" | "subtitle" = "title"): React.ReactNode {
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
          style.fontSize = vw(40)
          style.fontWeight = "normal"
          if (isUnderline) {
            style.color = "#817931"; style.fontWeight = "bold"; style.fontSize = vw(48)
          } else if (isBoldValue) {
            style.color = "#5E5616"; style.fontWeight = "bold"; style.fontSize = vw(48)
          }
        }
        return <span key={globalIndex} style={style}>{node.text}</span>
      }
      return null
    })
  }
  return renderRecursive(nodes)
}

export function SupportCustomizedSection({ title, product, manufacturing }: SupportCustomizedSectionProps) {
  const [activeGroup, setActiveGroup] = useState<"product" | "manufacturing">("product")
  const activeData = activeGroup === "product" ? product : manufacturing
  const items = activeData.items
  const [activeIndex, setActiveIndex] = useState(0)
  
  const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

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

  const CustomToggleIcon = ({ direction = "right", fill = "#756f3f" }: { direction?: "left" | "right", fill?: string }) => (
    <svg 
      width="60" height="60" viewBox="0 0 60 60" fill="none" 
      className="transition-transform duration-500"
      style={{ transform: direction === "left" ? "rotate(180deg)" : "rotate(0deg)" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fillRule="evenodd" clipRule="evenodd" 
        d="M30 0c16.6208 0 30 13.0266 30 29 0 15.9734-13.3792 29-30 29-16.6208 0-30-13.0266-30-29 0-15.9734 13.3792-29 30-29z m-6.7451 19.7188l9.7406 9.6975-9.7406 9.6975 1.6602 1.6934 11.5852-11.4523-11.5859-11.4529-1.6595 1.6934z" 
        fill={fill} 
      />
    </svg>
  )

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

  return (
    <section className="relative bg-[#f6f4ed]" style={{ height: vw(1380), paddingTop: vw(120) }}>
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute rounded-full blur-[91px]" style={{ left: vw(96), top: vw(-237), width: vw(682), height: vw(682), backgroundColor: "#e9e19e75", zIndex: 1 }} />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute rounded-full blur-[91px]" style={{ left: vw(1657), top: vw(95), width: vw(131), height: vw(131), backgroundColor: "#fff5a8c7", zIndex: 1 }} />
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute rounded-full blur-[91px]" style={{ left: vw(1319), top: vw(258), width: vw(281), height: vw(281), backgroundColor: "#fff5a8c7", zIndex: 1 }} />

      <div className="relative z-10 mx-auto w-full px-[10vw]">
        <h2 className="text-center font-montserrat text-[#000000] mx-auto whitespace-pre-wrap" style={{ fontSize: vw(48), lineHeight: 1.6, width: vw(1500) }}>
          {renderNodes(title, vw)}
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
                style={{ fontSize: vw(60), lineHeight: 0.97, width: "fit-content", maxWidth: vw(900) }}
            >
                {renderFormattedText(activeData.title)}
            </motion.h3>
            
            <button 
                onClick={handleToggleGroup} 
                className={`${activeGroup === "manufacturing" ? "mr-[1.8vw]" : "ml-[1.8vw]"} cursor-pointer transition-transform hover:scale-110 active:scale-95 flex-shrink-0`}
                style={{ width: vw(60), height: vw(60) }}
            >
                <CustomToggleIcon direction={activeGroup === "product" ? "right" : "left"} />
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
              <motion.div key={item.id} onClick={() => setActiveIndex(idx)} layout className="relative flex-shrink-0 cursor-pointer" style={{ width: isActive ? vw(723) : vw(413), height: vw(428) }}>
                <motion.div layout className="z-[10] absolute left-0 top-0 overflow-hidden" style={{ width: vw(176), height: vw(426), borderRadius: vw(30) }}>
                  {item.image && <Image src={item.image.url} alt={item.image.alt || ""} fill sizes="20vw" className={`object-cover transition-all duration-700 ${isActive ? "" : "grayscale"}`} />}
                  {!item.image && <div className="w-full h-full bg-[#d9d9d9]" />}
                </motion.div>
                <motion.div layout className="absolute" style={{ left: vw(115), top: vw(42), width: isActive ? vw(608) : vw(298), height: vw(386) }}>
                  {isActive ? <ActiveSubtractSVG /> : <InactiveSubtractSVG />}
                </motion.div>
                <div className="absolute z-10 w-full h-full pointer-events-none">
                  <motion.h4 layout="position" className="absolute font-montserrat font-bold overflow-hidden whitespace-pre-wrap" style={{ fontSize: isActive ? vw(29) : vw(24), color: isActive ? "#000000" : "transparent", left: isActive ? vw(243) : vw(229), top: isActive ? vw(81) : vw(121), width: isActive ? vw(400) : vw(150), lineHeight: isActive ? 1.28 : 1.91 }}>
                    {!isActive ? <span className="block text-[#f8f6e5] font-montserrat font-bold whitespace-pre-wrap" style={{ WebkitTextStroke: "1.2px #000000", paintOrder: "stroke fill" }}>{item.title}</span> : item.title}
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
