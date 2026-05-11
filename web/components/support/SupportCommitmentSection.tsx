"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

const DEFAULT_ICONS = [
  "/support-commitment/icon-1.png",
  "/support-commitment/icon-2.png",
  "/support-commitment/icon-3.png",
  "/support-commitment/icon-4.png",
]

const SubtractIcon = ({ fill = "currentColor", stroke = "none", className = "" }: { fill?: string, stroke?: string, className?: string }) => (
  <svg 
    width="43" 
    height="44" 
    viewBox="0 0 43 44" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M0 22.02637c0.00004-12.16476 9.6259-22.02637 21.5-22.02637 11.8741 0 21.49996 9.86161 21.5 22.02637 0 12.16479-9.62587 22.02637-21.5 22.02636-11.87412 0-21.5-9.86158-21.5-22.02636z m14.43262 5.0039l7.09765-7.22656 7.09668 7.22656 1.23926-1.23144-8.33594-8.59473-8.33691 8.59571 1.23926 1.23046z" 
      fill={fill} 
      stroke={stroke}
      strokeWidth={stroke !== "none" ? 1 : 0}
    />
  </svg>
)

interface SupportCard {
  icon?: string | { url: string }
  title: string
  subtitle?: string
}

interface GroupData {
  title: string
  items: SupportCard[]
}

interface SupportCommitmentSectionProps {
  title: string | any[]
  subtitle: string | any[]
  technical?: GroupData
  marketing?: GroupData
}

function renderNodes(nodes: any[], context: "title" | "subtitle" = "title"): React.ReactNode {
  let globalIndex = 0
  const renderRecursive = (nodeList: any[]): React.ReactNode[] => {
    return nodeList.map((node) => {
      globalIndex++
      if (node.type === "linebreak") return <br key={globalIndex} />
      if (node.children) return <React.Fragment key={globalIndex}>{renderRecursive(node.children)}</React.Fragment>
      if (node.text !== undefined) {
        const isBold = (node.format & 1) !== 0
        const isUnderline = (node.format & 8) !== 0
        let style: React.CSSProperties = {}
        if (context === "title") {
          style.fontSize = vw(36)
          style.fontWeight = "normal"
          if (isUnderline) {
            style.color = "#817931"; style.fontWeight = "bold"; style.fontSize = vw(54)
          } else if (isBold) {
            style.color = "#5E5616"; style.fontWeight = "bold"; style.fontSize = vw(54)
          }
        } else if (context === "subtitle") {
          style.color = "#181818"
          if (isBold) { style.color = "#FF9900"; style.fontWeight = "bold" }
        }
        return <span key={globalIndex} style={style}>{node.text}</span>
      }
      return null
    })
  }
  return renderRecursive(nodes)
}

export function SupportCommitmentSection({ title, subtitle, technical, marketing }: SupportCommitmentSectionProps) {
  const hasTechnical = !!(technical && technical.items?.length > 0)
  const hasMarketing = !!(marketing && marketing.items?.length > 0)
  const [activeGroup, setActiveGroup] = useState<"technical" | "marketing">(hasTechnical ? "technical" : "marketing")
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const currentGroupData = activeGroup === "technical" ? technical : marketing
  const items = currentGroupData?.items || []
  const groupTitle = currentGroupData?.title || ""

  useEffect(() => { setActiveIndex(0) }, [activeGroup])
  useEffect(() => {
    if (items.length <= 1 || isPaused) return
    const timer = setInterval(() => { setActiveIndex((prev) => (prev + 1) % items.length) }, 5000)
    return () => clearInterval(timer)
  }, [items.length, activeGroup, isPaused])

  const handleToggleGroup = () => { if (hasTechnical && hasMarketing) setActiveGroup(prev => prev === "technical" ? "marketing" : "technical") }

  if (!hasTechnical && !hasMarketing) return null
  const currentItem = items[activeIndex] || { title: "" }

  return (
    <section className="relative w-full bg-[#f2efd8] overflow-hidden" style={{ height: vw(760) }}>
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        <div className="absolute" style={{ left: vw(177), top: vw(123), width: vw(533), height: vw(471), zIndex: -1 }}>
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute rounded-full" style={{ left: vw(0), top: vw(254), width: vw(59), height: vw(59), backgroundColor: "#5b5313" }} />
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute rounded-full opacity-66" style={{ left: vw(144), top: vw(95), width: vw(59), height: vw(59), background: "linear-gradient(180deg, #dbd076 0%, #756f3f 100%)" }} />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} className="absolute rounded-full" style={{ left: vw(332), top: vw(412), width: vw(59), height: vw(59), background: "linear-gradient(180deg, #dbd076 0%, #756f3f 100%)" }} />
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute rounded-full" style={{ left: vw(474), top: vw(0), width: vw(59), height: vw(59), backgroundColor: "#c8c07f" }} />
        </div>
        <div className="absolute" style={{ left: vw(153), top: vw(200), width: vw(900) }}>
          <h2 className="font-montserrat text-black whitespace-pre-wrap" style={{ lineHeight: 1.4 }}>
            {Array.isArray(title) ? renderNodes(title) : title}
          </h2>
        </div>
        <div className="absolute border border-dashed border-[#574f0e] bg-[#faf5cd]" style={{ left: vw(628), top: vw(219), width: 'auto', height: 'auto', borderRadius: vw(30), padding: `${vw(12)} ${vw(12)}`, zIndex: 1 }}>
          <p className="font-anaheim text-[20px] leading-[1.5]" style={{ fontSize: vw(16) }}>{Array.isArray(subtitle) ? renderNodes(subtitle, "subtitle") : subtitle}</p>
        </div>
        <div className="absolute" style={{ left: vw(1062), top: vw(249), width: vw(700), height: vw(318) }}>
          <div className="absolute" style={{ left: 0, top: 0, width: vw(170), height: vw(350), zIndex: 10 }} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            {items.map((item, idx) => {
              const iconUrl = DEFAULT_ICONS[idx % DEFAULT_ICONS.length]
              const positions = [{ x: 38, y: -20 }, { x: 0, y: 108 }, { x: 38, y: 215 }, { x: 120, y: 290 }]
              const pos = positions[idx % 4]
              const isActive = activeIndex === idx
              return (
                <button key={idx} onClick={() => setActiveIndex(idx)} className="absolute flex items-center justify-center transition-all duration-500" style={{ left: vw(pos.x), top: vw(pos.y), width: isActive ? vw(110) : vw(56), height: isActive ? vw(84) : vw(56), marginLeft: isActive ? vw(-27) : 0, marginTop: isActive ? vw(-14) : 0, borderRadius: isActive ? vw(42) : "50%", backgroundColor: isActive ? '#262203' : 'transparent', border: 'none', zIndex: 10 }}>
                  <div style={{ width: vw(34), height: vw(34), position: 'relative' }}>
                    <Image src={iconUrl} alt={item.title || "Icon"} fill className="object-contain" style={{ filter: isActive ? "brightness(0) invert(1)" : "brightness(0)" }} />
                  </div>
                </button>
              )
            })}
          </div>
          <div className="absolute flex items-center justify-center overflow-hidden" style={{ left: vw(66), top: vw(-7), width: vw(281), height: vw(281), borderRadius: '50%', background: 'linear-gradient(180deg, #756f3f 0%, #dbd076 100%)', zIndex: 5 }}>
            <AnimatePresence mode="wait"><motion.div key={activeIndex + activeGroup} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="text-center px-6"><h3 className="font-montserrat font-normal text-white" style={{ fontSize: vw(28), lineHeight: 1.36 }}>{currentItem.title?.split(/\\n|\n/).map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>)}</h3></motion.div></AnimatePresence>
          </div>
          <div className="absolute border border-[#574f0e] flex flex-col justify-center z-[10]" style={{ left: vw(320), top: vw(14), width: vw(378), height: vw(251), borderRadius: vw(125.5), backgroundColor: 'transparent' }}>
              <div className="relative mx-auto" style={{ width: vw(300), marginLeft: vw(40) }}>
                <AnimatePresence mode="wait"><React.Fragment key={activeGroup}><motion.h4 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="font-lemon font-bold text-transparent w-full" style={{ fontSize: vw(32), lineHeight: 1.31, WebkitTextStroke: "0.5px #978e45", position: 'absolute', top: 4, left: 1, zIndex: 0 }}>{groupTitle.split(/\\n|\n/).map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>)}</motion.h4><motion.h4 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="font-lemon font-bold text-[#464010] w-full" style={{ fontSize: vw(32), lineHeight: 1.31, textShadow: "0px 1px 1px #978e45", position: 'relative', zIndex: 1 }}>{groupTitle.split(/\\n|\n/).map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>)}</motion.h4></React.Fragment></AnimatePresence>
              </div>
              {hasTechnical && hasMarketing && (
                  <div className="absolute flex flex-col items-center justify-between z-[50]" style={{ right: vw(34), top: vw(60), height: vw(100) }}>
                  <button onClick={handleToggleGroup} className="transition-transform hover:scale-105 active:scale-95 cursor-pointer relative z-50 pointer-events-auto" style={{ width: vw(40), height: vw(40) }}><SubtractIcon fill="#756f3f" /></button>
                  <div className="h-4" /> 
                  <button onClick={handleToggleGroup} className="transition-transform hover:scale-105 active:scale-95 cursor-pointer relative z-50 pointer-events-auto" style={{ width: vw(40), height: vw(40) }}><SubtractIcon fill="#f2efd8" stroke="#b9b280" className="rotate-180" /></button>
                </div>
              )}
           </div>
        </div>
      </div>
    </section>
  )
}
