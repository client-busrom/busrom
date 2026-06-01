"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"

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
  description?: string | any[]
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

const Sphere = () => (
  <motion.span
    animate={{ y: [0, -15, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    className="inline-block rounded-full align-middle mx-[0.2em]"
    style={{ width: vw(59), height: vw(59), backgroundColor: "#5b5313", marginTop: vw(-5) }}
  />
)

function renderTitleString(text: any, locale: string) {
  if (typeof text !== 'string') return text;
  const processed = locale === "en" ? text : text.replace(/\n/g, ' ');
  const parts = processed.split(/ {2,}/);
  if (parts.length === 1) return processed;
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && <Sphere key={`sphere-${i}`} />}
    </React.Fragment>
  ));
}

function renderNodes(nodes: any[], context: "title" | "subtitle" = "title", isDesktop: boolean = true, locale: string = "en"): React.ReactNode {
  let globalIndex = 0
  const renderRecursive = (nodeList: any[]): React.ReactNode[] => {
    return nodeList.map((node) => {
      globalIndex++
      if (node.type === "linebreak") return locale === "en" ? <br key={globalIndex} /> : <span key={globalIndex}> </span>
      if (node.children) return <React.Fragment key={globalIndex}>{renderRecursive(node.children)}</React.Fragment>
      if (node.text !== undefined) {
        const isBold = (node.format & 1) !== 0
        const isUnderline = (node.format & 8) !== 0
        let style: React.CSSProperties = {}
        if (context === "title") {
          if (isDesktop) {
            style.fontSize = vw(40)
            style.fontWeight = "normal"
            if (isUnderline) {
              style.color = "#817931"; style.fontWeight = "bold"; style.fontSize = vw(48)
            } else if (isBold) {
              style.color = "#5E5616"; style.fontWeight = "bold"; style.fontSize = vw(48)
            }
          } else {
            // Mobile sizes
            style.fontSize = "1.25rem"
            style.fontWeight = "normal"
            if (isUnderline) {
              style.color = "#817931"; style.fontWeight = "bold"; style.fontSize = "1.5rem"
            } else if (isBold) {
              style.color = "#5E5616"; style.fontWeight = "bold"; style.fontSize = "1.5rem"
            }
          }
        } else if (context === "subtitle") {
          style.color = "#181818"
          if (isBold) { style.color = "#FF9900"; style.fontWeight = "bold" }
        }

        let content: React.ReactNode = node.text
        if (context === "title" && typeof node.text === "string" && node.text.match(/ {2,}/)) {
          const parts = node.text.split(/ {2,}/)
          content = parts.map((part: any, i: any) => (
            <React.Fragment key={i}>
              {part}
              {i < parts.length - 1 && <Sphere key={`sphere-${i}`} />}
            </React.Fragment>
          ))
        }
        return <span key={globalIndex} style={style}>{content}</span>
      }
      return null
    })
  }
  return renderRecursive(nodes)
}

export function SupportCommitmentSection({ title, subtitle, technical, marketing }: SupportCommitmentSectionProps) {
  const { locale } = useParams() as { locale: string }
  const hasTechnical = !!(technical && technical.items?.length > 0)
  const hasMarketing = !!(marketing && marketing.items?.length > 0)
  const [activeGroup, setActiveGroup] = useState<"technical" | "marketing">(hasTechnical ? "technical" : "marketing")
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  const currentGroupData = activeGroup === "technical" ? technical : marketing
  const items = currentGroupData?.items || []
  const groupTitle = currentGroupData?.title || ""

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => { setActiveIndex(0) }, [activeGroup])
  useEffect(() => {
    if (items.length <= 1 || isPaused) return
    const timer = setInterval(() => { setActiveIndex((prev) => (prev + 1) % items.length) }, 5000)
    return () => clearInterval(timer)
  }, [items.length, activeGroup, isPaused])

  const [vwScale, setVwScale] = useState(1);
  useEffect(() => {
    const update = () => setVwScale(Math.min(window.innerWidth, 1920) / 1920);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const vwn = (px: number) => px * vwScale;

  const [hoverTop, setHoverTop] = useState(false)
  const [hoverBottom, setHoverBottom] = useState(false)

  const handleToggleGroup = () => { if (hasTechnical && hasMarketing) setActiveGroup(prev => prev === "technical" ? "marketing" : "technical") }

  if (!hasTechnical && !hasMarketing) return null
  const currentItem = items[activeIndex] || { title: "" }

  if (!isDesktop) {
    return (
      <section className="relative bg-[#f6f4ed] py-20 px-6 overflow-hidden">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute rounded-full opacity-30" style={{ left: '10%', top: '5%', width: '40px', height: '40px', background: "linear-gradient(180deg, #dbd076 0%, #756f3f 100%)" }} />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute rounded-full opacity-30" style={{ right: '10%', top: '20%', width: '60px', height: '60px', backgroundColor: "#c8c07f" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-24 w-full">
            <h2 className="font-montserrat text-black mb-8" style={{ lineHeight: 1.5 }}>
              {Array.isArray(title) ? renderNodes(title, "title", false, locale) : renderTitleString(title, locale)}
            </h2>
            <div className="inline-block bg-[#faf5cd] rounded-xl px-5 py-3 border-[1.5px] border-dashed border-[#574F0E] max-w-[90%] md:max-w-[400px]">
              <p className="font-montserrat text-sm text-[#574F0E] leading-relaxed text-left" style={{ textWrap: 'balance' }}>
                {Array.isArray(subtitle) ? renderNodes(subtitle, "subtitle", false, locale) : (locale === "en" || typeof subtitle !== 'string' ? subtitle : subtitle.replace(/\n/g, ' '))}
              </p>
            </div>
          </div>

          {/* Interactive Area for Mobile */}
          <div className="relative w-full max-w-[340px] aspect-square mb-12 mt-8 flex items-center justify-center">
            {/* Center Sphere */}
            <div className="w-[200px] h-[200px] rounded-full flex items-center justify-center text-center p-6 bg-gradient-to-b from-[#756f3f] to-[#dbd076] shadow-xl z-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={activeIndex + activeGroup}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="font-montserrat font-medium text-white text-lg leading-snug"
                >
                  {currentItem.title?.split(/\\n|\n/).map((line, i, arr) => (
                    <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
                  ))}
                </motion.h3>
              </AnimatePresence>
            </div>

            {/* Orbiting Icons */}
            {items.map((item, idx) => {
              const iconUrl = DEFAULT_ICONS[idx % DEFAULT_ICONS.length]
              const angle = (idx / items.length) * 2 * Math.PI - Math.PI / 2
              const radius = 125
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              const isActive = activeIndex === idx

              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className="absolute flex items-center justify-center transition-all duration-500 z-10"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: isActive ? '74px' : '54px',
                    height: isActive ? '58px' : '54px',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: isActive ? '18px' : '50%',
                    backgroundColor: isActive ? '#262203' : 'white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                >
                  <div className="w-6 h-6 relative">
                    <img src={iconUrl} alt="Icon" className="w-full h-full object-contain" style={{ filter: isActive ? "brightness(0) invert(1)" : "brightness(0)" }} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Description */}
          <div className="w-full text-center px-4 mb-10 min-h-[80px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeIndex + activeGroup}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-montserrat text-[#1c1c1c] text-base leading-relaxed"
              >
                {Array.isArray(currentItem.description) ? renderNodes(currentItem.description, "title", true, locale) : (locale === "en" || typeof currentItem.description !== 'string' ? currentItem.description : currentItem.description.replace(/\n/g, ' '))}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={() => { setActiveGroup("technical"); setActiveIndex(0); }}
              className={`flex-1 max-w-[150px] py-4 rounded-full font-montserrat font-bold text-xs transition-all ${activeGroup === "technical" ? "bg-[#262203] text-white shadow-lg" : "bg-[#f2efd8] text-[#262203] border border-[#262203]"}`}
            >
              {technical?.title || "Technical"}
            </button>
            <button
              onClick={() => { setActiveGroup("marketing"); setActiveIndex(0); }}
              className={`flex-1 max-w-[150px] py-4 rounded-full font-montserrat font-bold text-xs transition-all ${activeGroup === "marketing" ? "bg-[#262203] text-white shadow-lg" : "bg-[#f2efd8] text-[#262203] border border-[#262203]"}`}
            >
              {marketing?.title || "Marketing"}
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full bg-[#f2efd8] overflow-hidden" style={{ height: vw(760) }}>
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        <div className="absolute" style={{ left: vw(177), top: vw(103), width: vw(533), height: vw(471), zIndex: -1 }}>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute rounded-full opacity-66" style={{ left: vw(144), top: vw(95), width: vw(59), height: vw(59), background: "linear-gradient(180deg, #dbd076 0%, #756f3f 100%)" }} />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} className="absolute rounded-full" style={{ left: vw(332), top: vw(412), width: vw(59), height: vw(59), background: "linear-gradient(180deg, #dbd076 0%, #756f3f 100%)" }} />
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute rounded-full" style={{ left: vw(474), top: vw(0), width: vw(59), height: vw(59), backgroundColor: "#c8c07f" }} />
        </div>
        <div className="absolute" style={{ left: vw(153), top: vw(220), width: vw(900) }}>
          {locale !== "en" && <div style={{ float: 'right', width: vw(420), height: vw(150), shapeOutside: 'inset(0)' }} />}
          <h2 className="font-montserrat text-black whitespace-pre-wrap" lang={locale} style={{ lineHeight: 1.4, hyphens: 'auto', WebkitHyphens: 'auto' }}>
            {Array.isArray(title) ? renderNodes(title, "title", true, locale) : renderTitleString(title, locale)}
          </h2>
        </div>
        <div className="absolute bg-[#faf5cd]" style={{
          left: vw(660),
          top: vw(236),
          width: 'auto',
          maxWidth: vw(300),
          height: 'auto',
          borderRadius: vw(20),
          padding: `${vw(12)} ${vw(20)}`,
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='${vwn(20)}' ry='${vwn(20)}' stroke='%23574F0E' stroke-width='${vwn(1.5)}' stroke-dasharray='${vwn(4)}%2c ${vwn(4)}' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }}>
          <p className="font-montserrat text-[20px] leading-[1.5] text-left" style={{ fontSize: vw(16), textWrap: locale === "en" ? "wrap" : "balance" }}>{Array.isArray(subtitle) ? renderNodes(subtitle, "subtitle", true, locale) : (locale === "en" || typeof subtitle !== 'string' ? subtitle : subtitle.replace(/\n/g, ' '))}</p>
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
                    <img src={iconUrl} alt={item.title || "Icon"} className="w-full h-full object-contain" style={{ filter: isActive ? "brightness(0) invert(1)" : "brightness(0)" }} />
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
                <button
                  onClick={handleToggleGroup}
                  onMouseEnter={() => setHoverTop(true)}
                  onMouseLeave={() => setHoverTop(false)}
                  className="transition-all hover:scale-110 active:scale-95 cursor-pointer relative z-50 pointer-events-auto"
                  style={{ width: vw(40), height: vw(40) }}
                >
                  <SubtractIcon
                    fill={hoverTop ? "#756f3f" : "#f2efd8"}
                    stroke={hoverTop ? "none" : "#b9b280"}
                  />
                </button>
                <div className="h-4" />
                <button
                  onClick={handleToggleGroup}
                  onMouseEnter={() => setHoverBottom(true)}
                  onMouseLeave={() => setHoverBottom(false)}
                  className="transition-all hover:scale-110 active:scale-95 cursor-pointer relative z-50 pointer-events-auto"
                  style={{ width: vw(40), height: vw(40) }}
                >
                  <SubtractIcon
                    fill={hoverBottom ? "#756f3f" : "#f2efd8"}
                    stroke={hoverBottom ? "none" : "#b9b280"}
                    className="rotate-180"
                  />
                </button>
              </div>
            )}
          </div>
          <div className="absolute" style={{ left: vw(415), top: vw(16), width: vw(218) }}>
            <p className="font-montserrat text-[#1c1c1c] leading-[1.36]" style={{ fontSize: vw(20) }}>{Array.isArray(currentItem.description) ? renderNodes(currentItem.description, "title", true, locale) : (locale === "en" || typeof currentItem.description !== 'string' ? currentItem.description : currentItem.description.replace(/\n/g, ' '))}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
