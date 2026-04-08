"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface TrustSectionProps {
  title?: string
  items?: any[]
  images?: any[]
  bgImage?: any
}

export function TrustSection({ title, items, images = [], bgImage }: TrustSectionProps) {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0])
  
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  const toggleIndex = (index: number) => {
    setExpandedIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    )
  }

  const displayItems = items || []


  // Helper for item-level drag scroll
  const DescriptionContent = ({ text }: { text: string }) => {
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)
    const [showScroll, setShowScroll] = useState(false)

    useEffect(() => {
      const checkHeight = () => {
        if (contentRef.current) {
          const style = window.getComputedStyle(contentRef.current)
          const lh = parseInt(style.lineHeight) || 24
          const maxHeightPc = lh * 3.1 // 3 lines threshold
          if (contentRef.current.scrollHeight > maxHeightPc) {
            setShowScroll(true)
          } else {
            setShowScroll(false)
          }
        }
      }
      checkHeight()
      setTimeout(checkHeight, 50) // Re-check after layout stability
      window.addEventListener('resize', checkHeight)
      return () => window.removeEventListener('resize', checkHeight)
    }, [text])

    const onMouseDown = (e: React.MouseEvent) => {
      // Prevent global scroll when interacting with item internal scroll
      e.stopPropagation()
      if (!showScroll || !contentRef.current) return
      setDragging(true)
      setStartY(e.pageY - contentRef.current.offsetTop)
      setScrollTop(contentRef.current.scrollTop)
    }

    const onMouseMove = (e: React.MouseEvent) => {
      if (!dragging || !contentRef.current) return
      e.preventDefault()
      const y = e.pageY - contentRef.current.offsetTop
      const walk = (y - startY) * 1.5
      contentRef.current.scrollTop = scrollTop - walk
    }

    const onMouseUp = () => setDragging(false)
    const onMouseLeave = () => setDragging(false)

    return (
      <div
        ref={contentRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onWheel={(e) => showScroll && e.stopPropagation()}
        data-lenis-prevent={showScroll}
        className={`overflow-y-auto custom-scrollbar-inner transition-all ${showScroll ? 'max-h-[72px] lg:max-h-[82px] cursor-grab active:cursor-grabbing' : ''}`}
      >
        <style jsx>{`
          .custom-scrollbar-inner::-webkit-scrollbar {
            width: 2px;
          }
          .custom-scrollbar-inner::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar-inner::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
        `}</style>
        <p className="text-[16px] lg:text-[18px] font-medium text-white/80 leading-relaxed pb-4 lg:pr-[40px]" style={{ fontFamily: "var(--font-anaheim)" }}>
          {text}
        </p>
      </div>
    )
  }

  // 2. Global Drag-to-Scroll logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageY - scrollRef.current.offsetTop)
    setScrollTop(scrollRef.current.scrollTop)
  }

  const handleMouseLeave = () => setIsDragging(false)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const y = e.pageY - scrollRef.current.offsetTop
    const walk = (y - startX) * 1.5 // Scroll speed
    scrollRef.current.scrollTop = scrollTop - walk
  }

  const getImage = (index: number) => {
    if (!images[index]) return null
    return images[index].image || images[index]
  }

  return (
    <section 
      className="relative w-full overflow-hidden flex flex-col items-center bg-black py-32 lg:py-0 min-h-[922px] lg:h-[922px] lg:min-h-[922px]"
    >
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
         {bgImage && (
           <OptimizedImage image={bgImage} alt="Background" className="w-full h-full object-cover opacity-70" size="large" />
         )}
         <div 
           className="absolute inset-0 z-10 backdrop-blur-[8px]"
           style={{ backgroundColor: 'rgba(86, 76, 0, 0.5)' }}
         />
      </div>

      {/* 2. Content Container - Centered Rail */}
      <div className="relative z-20 w-full max-w-[1536px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between px-6 lg:pl-[112px] lg:pr-[80px] gap-12 lg:gap-0 lg:pt-[100px] h-full">
        
        {/* Left Column: Title & Accordion */}
        <div className="w-full lg:w-[629.6px] shrink-0">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[32px] lg:text-[60px] font-extrabold text-white leading-tight lg:leading-[70px] tracking-[0.05em] mb-8 lg:mb-10 text-center lg:text-left select-none"
            style={{ fontFamily: "var(--font-anaheim)" }}
            dangerouslySetInnerHTML={{ __html: (title || "Why Contractors<br />Trust Us?").replace(/\n/g, '<br />') }}
          />

          {/* Items Container - Global Drag Scroll restored */}
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onWheel={(e) => e.stopPropagation()}
              data-lenis-prevent
              className={`w-full lg:max-w-[640px] mx-auto lg:mx-0 lg:max-h-[540px] lg:overflow-y-auto lg:pr-8 custom-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 242, 142, 0.3);
                border-radius: 10px;
                transition: background 0.3s;
              }
              .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                background: rgba(255, 242, 142, 0.6);
              }
            `}</style>
              {displayItems.map((item, i) => {
                  const isExpanded = expandedIndices.includes(i)
                  return (
                      <div key={i} className="mb-2 lg:mb-4 group border-b border-white/10">
                          <button 
                              onClick={() => !isDragging && toggleIndex(i)}
                              className="w-full flex justify-between items-center text-left py-4 transition-all"
                          >
                              <h4 
                                  className={`text-[18px] lg:text-[22px] font-bold transition-colors duration-300 ${isExpanded ? 'text-[#FFF28E]' : 'text-white/60 group-hover:text-white'}`}
                                  style={{ fontFamily: "var(--font-anaheim)" }}
                              >
                                  {item.title}
                              </h4>
                              <div className={`w-8 h-8 lg:w-[40px] lg:h-[40px] rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${isExpanded ? 'border-[#FFF28E] bg-[#FFF28E] text-black rotate-180' : 'border-white/20 text-white'}`}>
                                  {isExpanded ? <Minus className="w-4 h-4 lg:w-[20px] lg:h-[20px]" strokeWidth={3} /> : <Plus className="w-4 h-4 lg:w-[20px] lg:h-[20px]" strokeWidth={3} />}
                              </div>
                          </button>
 
                          <AnimatePresence initial={false}>
                              {isExpanded && (
                                  <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.4 }}
                                      className="overflow-hidden"
                                  >
                                      <DescriptionContent text={item.description || item.summary || ""} />
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>
                  )
              })}
          </div>
        </div>

        {/* Right Column: Scatter Images */}
        <div className="relative w-full lg:w-auto h-[450px] lg:h-full lg:flex-grow flex items-center justify-center lg:block min-h-[750px] lg:min-h-[900px]">
            {/* Image 1 - top scatter (Pencil: image1) */}
            <motion.div 
                initial={{ rotate: 2.19, x: 0 }}
                animate={{ 
                    y: [0, -10]
                }}
                whileHover={{ scale: 1.05, x: -15, y: -15, rotate: 0 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                    y: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                    scale: { type: "spring", stiffness: 300 },
                    x: { type: "spring", stiffness: 300 }
                }}
                className="absolute shadow-2xl rounded-[30px] lg:rounded-[54px] overflow-hidden z-30 lg:left-[135px] lg:top-[20px] cursor-pointer"
                style={{ 
                  left: "calc(50% - 200px)",
                  top: "10px",
                }}
            >
                <div className="w-[180px] h-[124px] lg:w-[235px] lg:h-[162px]">
                    {getImage(0) ? <OptimizedImage image={getImage(0)} alt="image1" className="w-full h-full object-cover" size="medium" /> : <div className="w-full h-full bg-white/10" />}
                </div>
            </motion.div>

            {/* Image 2 - Main Large Image (Pencil: image2) */}
            <motion.div 
                initial={{ rotate: 8.15, x: 0 }}
                animate={{ 
                    y: [0, 10]
                }}
                whileHover={{ scale: 1.03, x: 20, y: -20, rotate: 10 }}
                whileTap={{ scale: 0.98 }}
                transition={{
                    y: { duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 },
                    scale: { type: "spring", stiffness: 300 },
                    x: { type: "spring", stiffness: 300 }
                }}
                className="absolute shadow-2xl rounded-[30px] lg:rounded-[54px] overflow-hidden z-0 lg:left-[333px] lg:top-[122px] cursor-pointer"
                style={{ 
                  left: "calc(50% - 60px)",
                  top: "160px",
                }}
            >
                <div className="w-[220px] h-[280px] lg:w-[331px] lg:h-[425px]">
                    {getImage(1) ? <OptimizedImage image={getImage(1)} alt="image2" className="w-full h-full object-cover" size="xlarge" /> : <div className="w-full h-full bg-white/10" />}
                </div>
            </motion.div>

            {/* Image 3 - mid left scatter (Pencil: image3) */}
            <motion.div 
                initial={{ rotate: -20.86, x: 0 }}
                animate={{ 
                    y: [0, -15]
                }}
                whileHover={{ scale: 1.05, x: -25, y: 15, rotate: -25 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                    y: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 },
                    scale: { type: "spring", stiffness: 300 },
                    x: { type: "spring", stiffness: 300 }
                }}
                className="hidden lg:block absolute shadow-2xl rounded-[40px] lg:rounded-[54px] overflow-hidden z-20 cursor-pointer"
                style={{ 
                  left: "50px", 
                  top: "300px"
                }}
            >
                <div className="w-[229px] h-[258px]">
                    {getImage(2) ? <OptimizedImage image={getImage(2)} alt="image3" className="w-full h-full object-cover" size="medium" /> : <div className="w-full h-full bg-white/10" />}
                </div>
            </motion.div>

            {/* Image 4 - bottom scatter (Pencil: image4) */}
            <motion.div 
                initial={{ rotate: -5.5, x: 0 }}
                animate={{ 
                    y: [0, 8]
                }}
                whileHover={{ scale: 1.05, x: 20, y: 20, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                    y: { duration: 2.25, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.2 },
                    scale: { type: "spring", stiffness: 300 },
                    x: { type: "spring", stiffness: 300 }
                }}
                className="hidden lg:block absolute shadow-2xl rounded-[30px] lg:rounded-[54px] overflow-hidden z-10 cursor-pointer"
                style={{ 
                  left: "268px", 
                  top: "520px"
                }}
            >
                <div className="w-[245px] h-[234px]">
                    {getImage(3) ? <OptimizedImage image={getImage(3)} alt="image4" className="w-full h-full object-cover" size="medium" /> : <div className="w-full h-full bg-white/10" />}
                </div>
            </motion.div>
        </div>
      </div>
    </section>
  )
}
