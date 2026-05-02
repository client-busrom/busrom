"use client"
 
import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import useEmblaCarousel from "embla-carousel-react"
 
interface SectionSlide {
  title: string
  description: string
  image: { url: string } | any
}
 
interface AdvantagesSectionProps {
  title?: string
  advantages: SectionSlide[]
}
 
const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`
 
export function AdvantagesSection({ title, advantages }: AdvantagesSectionProps) {
  const [index, setIndex] = useState(0)
  
  // Responsive measurements
  const [layout, setLayout] = useState({ 
    type: 'mobile', 
    width: 0, 
    gap: 16, 
    padding: 24, 
    cardH: 450
  })

  // 1. Embla Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center', // USE CENTER FOR ALL to fix the "last item not active" issue
    skipSnaps: false,
    dragFree: false, 
    containScroll: false 
  })

  // Sync internal Embla state with our index state
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  // External control: clicking a card scrolls to it
  const scrollTo = useCallback((idx: number) => {
    if (emblaApi) emblaApi.scrollTo(idx)
  }, [emblaApi])
 
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 1024) {
        if (w < 640) {
          setLayout({ type: 'mobile', width: w * 0.75, gap: 16, padding: 0, cardH: 400 })
        } else {
          setLayout({ type: 'tablet', width: w * 0.45, gap: 24, padding: 0, cardH: 450 })
        }
      } else {
        setLayout({ type: 'desktop', width: 0, gap: 0, padding: 0, cardH: 0 })
      }
      if (emblaApi) emblaApi.reInit()
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [emblaApi])
 
  if (!advantages || advantages.length === 0) return null
 
  return (
    <section 
      className="relative w-full bg-[#F6F4ED] select-none py-12 lg:py-0 lg:h-[52vw] min-h-[700px] flex flex-col items-center"
    >
      <div className="flex flex-col w-full max-w-[1920px] justify-start lg:pt-[4vw]">
        
        {/* 1. Animated Background Circle (Breathing effect) */}
        <motion.div 
          className="absolute rounded-full pointer-events-none opacity-40 lg:opacity-80"
          style={{ 
            left: layout.type === 'desktop' ? vw(-328.3) : '-20vw', 
            top: layout.type === 'desktop' ? vw(-280) : '-10vw',    
            width: layout.type === 'desktop' ? vw(896) : '100vw',   
            height: layout.type === 'desktop' ? vw(896) : '100vw',
            background: "linear-gradient(to bottom, rgba(236, 232, 216, 0.28) 0%, rgba(236, 232, 216, 1) 100%)",
            transformOrigin: "center center"
          }}
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
 
        {/* 2. Section Title */}
        <div className="relative z-20 pointer-events-none px-10 lg:pl-[140px] mb-8 lg:mb-[16px] w-full lg:w-[vw(1000)] text-center lg:text-left">
          <h2 
            className="font-semibold leading-tight tracking-tight text-[#756F3F] text-[32px]"
            style={{ 
              fontSize: layout.type === 'desktop' ? vw(60) : "32px",
              fontFamily: "var(--font-anaheim)",
              background: "linear-gradient(to right, #756F3F 0%, rgba(117, 111, 63, 0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "Advantages And Features<br />Of Busrom's One-Stop Purchasing").replace(/\n/g, '<br />') }}
          />
        </div>
 
        {/* 3. Carousel - Embla Implementation */}
        <div 
          className="relative w-full h-auto pb-20 lg:pb-0 overflow-hidden" 
          ref={emblaRef}
        >
            <div
                className="flex relative items-start"
                style={{ 
                    paddingLeft: layout.type === 'desktop' ? "15vw" : 0,
                    paddingTop: layout.type === 'desktop' ? vw(50) : '20px',
                }}
            >
                {advantages.map((item, idx) => {
                const isActive = idx === index
                
                return (
                    <motion.div
                    key={idx}
                    animate={{ 
                        boxShadow: isActive 
                        ? "0px 78px 105.8px rgba(0, 0, 0, 0.15)" 
                        : "0px 4px 20px rgba(0, 0, 0, 0.05)",
                        scale: isActive ? 1 : 0.96,
                        opacity: isActive ? 1 : 0.8
                    }}
                    transition={{ duration: 0.5 }}
                    className="bg-white flex-shrink-0 relative overflow-hidden flex flex-col cursor-grab active:cursor-grabbing shadow-lg"
                    style={{ 
                        width: layout.type === 'desktop' ? vw(500) : layout.width,
                        height: layout.type === 'desktop' ? vw(720) : layout.cardH,
                        borderRadius: layout.type === 'desktop' ? vw(30) : "24px", 
                        padding: layout.type === 'desktop' ? vw(35) : "24px",
                        marginRight: layout.type === 'desktop' ? vw(40) : layout.gap,     
                    }}
                    onClick={() => scrollTo(idx)}
                    >
                    {/* Card Header */}
                    <div className="relative pointer-events-none" style={{ height: layout.type === 'desktop' ? vw(105) : "80px", marginBottom: vw(5) }}>
                        <motion.div 
                            className="absolute left-0 top-0 bg-[#BCB158] rounded-full shrink-0 z-0" 
                            style={{ width: layout.type === 'desktop' ? vw(56.7) : "40px", height: layout.type === 'desktop' ? vw(56.7) : "40px" }}
                            animate={isActive ? { 
                                scale: [1, 1.1, 1.05, 1],
                                y: [0, -6, 2, 0],
                                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            } : {}}
                        />
                        <h3 
                            className={`relative z-10 leading-tight transition-all duration-500 ${isActive ? 'font-extrabold text-black' : 'font-medium text-[#4A4A4A]'}`}
                            style={{ 
                                fontSize: layout.type === 'desktop' ? vw(24) : "18px", 
                                fontFamily: "var(--font-anaheim)",
                                paddingTop: layout.type === 'desktop' ? vw(20) : "12px",
                                paddingLeft: layout.type === 'desktop' ? vw(30) : "20px" 
                            }}
                        >
                            {item.title}
                        </h3>
                    </div>
 
                    {/* Card Image */}
                    <div 
                        className="rounded-[20px] lg:rounded-[30px] shadow-[0_31px_38.4px_rgba(0,0,0,0.17)] overflow-hidden bg-gray-50 pointer-events-none"
                        style={{ 
                        width: "100%", 
                        height: layout.type === 'desktop' ? vw(320) : "200px", 
                        marginBottom: layout.type === 'desktop' ? vw(50) : "36px", 
                        }}
                    >
                        <OptimizedImage 
                            image={item.image}
                            size="large"
                            priority={idx < 2}
                            loading={idx < 2 ? "eager" : "lazy"}
                            className="w-full h-full object-cover"
                            alt={item.title}
                        />
                    </div>
 
                    {/* Description Text */}
                    <div className="w-full pointer-events-none">
                        <p 
                        className="font-medium leading-normal text-black text-justify"
                        style={{ 
                          fontSize: layout.type === 'desktop' ? vw(20) : "15px", 
                          fontFamily: "var(--font-anaheim)" 
                        }}
                        >
                        {item.description}
                        </p>
                    </div>
                    </motion.div>
                )
                })}
            </div>
        </div>
      </div>
    </section>
  )
}
