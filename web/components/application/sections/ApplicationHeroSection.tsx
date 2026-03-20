"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 922px tall section at 1920px viewport = 48.02vw
// All vw() values scale proportionally with viewport width
const vw = (px: number) => `${(px / 1920) * 100}vw`

export interface HeroSlide {
  gradientTitle: string
  mainTitle: string
  subtitle: string
}

interface MediaObject {
  id: string
  url: string
  alt?: string
  [key: string]: any
}

interface Props {
  title: string
  topSubtitle?: string
  rightBoxText?: string
  bottomBoxText?: string
  seeAllText?: string
  slides: HeroSlide[]
  images: (MediaObject | null)[]
  locale?: string
  seeAllHref?: string
}

// Magnifier SVG icon
const MagnifierIcon = ({ size = 40 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: vw(size), height: vw(size) }} className="text-white drop-shadow-md">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const RightBoxFrame = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 414 404" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M49 0.5H365C391.786 0.5 413.5 22.2373 413.5 49.0234V268.703C413.5 293.991 393 314.5 367.713 314.5C341.362 314.5 320 335.862 320 362.213V365.434C320 386.457 302.957 403.5 281.934 403.5H49C22.2142 403.5 0.5 381.786 0.5 355V49C0.5 22.2142 22.2142 0.5 49 0.5Z" stroke="white"/>
    <path d="M398.829 336.171C414.346 351.688 414.346 376.845 398.829 392.362C383.312 407.879 358.154 407.879 342.637 392.362C327.121 376.846 327.121 351.688 342.637 336.171C358.154 320.654 383.312 320.654 398.829 336.171ZM381.361 371.348L381.357 371.32L379.595 358.995C379.48 358.188 378.733 357.628 377.926 357.744L377.901 357.748C377.107 357.876 376.559 358.617 376.674 359.416L377.965 368.45L362.028 356.515C361.484 356.107 360.712 356.218 360.303 356.763L360.2 356.901C359.807 357.445 359.92 358.206 360.459 358.609L376.395 370.545L367.363 371.848C366.556 371.964 365.995 372.712 366.11 373.52C366.226 374.326 366.974 374.887 367.781 374.771L380.105 372.993L380.132 372.989C380.218 372.975 380.302 372.954 380.385 372.925L380.401 372.919C380.653 372.843 380.875 372.688 381.032 372.478L381.123 372.355L381.134 372.341C381.281 372.138 381.363 371.896 381.369 371.646L381.369 371.635C381.376 371.539 381.373 371.443 381.361 371.348Z" fill="white"/>
  </svg>
)

const ViewMoreButton = ({ onClick, text }: { onClick: () => void, text: string }) => {
  return (
    <button onClick={onClick} className="relative group hover:opacity-90 transition-opacity" style={{ width: vw(230), height: vw(86) }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 230 86" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="7" width="225" height="71" rx="35.5" fill="white" fillOpacity="0.7"/>
        <circle cx="42.7332" cy="42.7332" r="30.2169" transform="rotate(-135 42.7332 42.7332)" fill="white"/>
        <path d="M34.8323 36.5812L34.8237 36.5927C34.7118 36.7466 34.6495 36.9311 34.6452 37.1214L34.645 37.1325L34.6453 37.1295C34.6401 37.2023 34.6421 37.2755 34.6511 37.3479L34.6539 37.3685L35.9936 46.7422C36.0813 47.356 36.65 47.7819 37.2638 47.6935L37.2821 47.6907C37.8859 47.5936 38.3028 47.0297 38.216 46.4221L37.234 39.5513L49.3538 48.6286C49.7677 48.9386 50.3549 48.8539 50.6652 48.4396L50.7438 48.3346C51.0431 47.9209 50.9568 47.3424 50.547 47.0354L38.4271 37.9582L45.2967 36.9679C45.9104 36.8795 46.3367 36.3103 46.249 35.6965C46.1613 35.0827 45.5926 34.6568 44.9788 34.7452L35.606 36.0963L35.5863 36.0993C35.5208 36.11 35.4563 36.1264 35.3937 36.1484L35.3779 36.1541L35.3809 36.1532C35.1893 36.2108 35.0212 36.3285 34.9015 36.4888L34.8323 36.5812Z" fill="#756F3F"/>
      </svg>
      {/* Absolute text over SVG */}
      <span className="absolute font-anaheim font-semibold text-[#756F3F] uppercase tracking-wider" style={{ left: vw(85), top: vw(28), fontSize: vw(24) }}>
        {text}
      </span>
    </button>
  )
}

export function ApplicationHeroSection({ title, topSubtitle, rightBoxText = "APPLICATION CASES", bottomBoxText = "VIEW MORE", seeAllText = "SEE ALL", slides, images, locale = "en", seeAllHref = "/cases" }: Props) {
  const [activeSlide, setActiveSlide] = useState(0)
  // displayImages[i] = index into `images[]`. [0]=center, [1]=right, [2]=bottom-right, [3]=bottom-left
  const [displayImages, setDisplayImages] = useState([0, 1, 2, 3])

  const nextSlide = useCallback(() => {
    setActiveSlide(prev => (prev + 1) % Math.max(slides.length, 1))
  }, [slides.length])

  const swapAndNext = useCallback((slotIdx: number) => {
    setDisplayImages(prev => {
      const next = [...prev]
      ;[next[0], next[slotIdx]] = [next[slotIdx], next[0]]
      return next
    })
    nextSlide()
  }, [nextSlide])

  const slide = slides[activeSlide] || { gradientTitle: "Professional", mainTitle: "Hardware Solutions For Every Space", subtitle: "" }
  const img = (slotIdx: number) => images[displayImages[slotIdx]] || null

  return (
    <section 
      data-header-theme="light"
      className="relative w-full select-none overflow-hidden h-auto lg:h-[50.416vw]" 
      style={{ 
        background: 'linear-gradient(to bottom, #756F3F 0%, #989260 100%)' 
      }}
    >
      {/* Dynamic top padding for desktop scaling visibility */}
      <div className="hidden lg:block h-[2.3958vw]" /> 
      {/* ============ DESKTOP ============ */}
      <div className="hidden lg:block absolute inset-0">
        
        {/* Scaling wrapper taking up 80% to fit neatly */}
        <div className="relative w-full h-full" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>

          {/* IMAGE LAYOUT ANIMATION BLOCK */}
          {displayImages.map((imageIdx, slotIdx) => {
            const config = (slotIdx === 0) ? { left: vw(671), top: vw(156), width: vw(716), height: vw(651), borderRadius: vw(60), zIndex: 5 } :
                           (slotIdx === 1) ? { left: vw(1453), top: vw(311), width: vw(392), height: vw(288), borderRadius: vw(39), zIndex: 5 } :
                           (slotIdx === 2) ? { left: vw(1001), top: vw(1004), width: vw(761), height: vw(517), borderRadius: vw(60), zIndex: 5 } :
                           /* slotIdx===3 */ { left: vw(69), top: vw(848), width: vw(569), height: vw(517), borderRadius: vw(60), zIndex: 5 };
            
            return (
              <motion.div
                key={`anim-img-${imageIdx}`}
                layout
                transition={{ type: "spring", stiffness: 220, damping: 28 }}
                className="absolute overflow-hidden pointer-events-none"
                style={config}
              >
                {images[imageIdx] ? <OptimizedImage image={images[imageIdx] as any} alt="App Image" size="large" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10" />}
              </motion.div>
            )
          })}

          {/* INTERACTIVE FRAMES OVERLAYS */}
          {/* SLOT 3 INTERACTION FRAME */}
          <div className="absolute group" style={{ left: vw(69), top: vw(848), width: vw(569), height: vw(517), zIndex: 10 }}>
            <div className="absolute pointer-events-none" style={{ top: vw(30), right: vw(30), zIndex: 10 }}>
              <MagnifierIcon size={60} />
            </div>
            <button onClick={() => swapAndNext(3)} className="absolute inset-0 w-full h-full z-20 cursor-pointer rounded-[60px]" />
          </div>

          {/* SLOT 2 INTERACTION FRAME */}
          <div className="absolute group" style={{ left: vw(1001), top: vw(1004), width: vw(761), height: vw(517), zIndex: 10 }}>
            <button onClick={() => swapAndNext(2)} className="absolute inset-0 w-full h-full z-20 cursor-pointer rounded-[60px]" />
          </div>

          {/* SLOT 1 INTERACTION FRAME (Right Box) */}
          <div className="absolute group" style={{ left: vw(1442), top: vw(299), width: vw(414), height: vw(404), zIndex: 10 }}>
            <RightBoxFrame />
            <div className="absolute pointer-events-none" style={{ left: vw(26), top: vw(339) }}>
              <span className="font-anaheim font-medium text-white uppercase tracking-widest" style={{ fontSize: vw(28), lineHeight: vw(40) }}>
                {rightBoxText}
              </span>
            </div>
            <button onClick={() => swapAndNext(1)} className="absolute inset-0 w-full h-full z-20 cursor-pointer rounded-[39px]" />
          </div>

          {/* TEXT CONTENT CONTAINER */}
          <div className="absolute flex flex-col items-start" style={{ left: vw(160), top: vw(132), zIndex: 20 }}>
            {/* Header / Title */}
            <div className="flex items-center" style={{ marginBottom: vw(10) }}>
              <span className="font-anaheim font-medium text-white tracking-widest" style={{ fontSize: vw(20), lineHeight: vw(40) }}>
                {title}
              </span>
              <div style={{ width: vw(70), height: '1px', backgroundColor: 'white', marginLeft: vw(16), marginRight: vw(16), transform: 'rotate(6.86deg)' }} />
              {topSubtitle && (
                <span className="font-anaheim font-medium text-white tracking-widest" style={{ fontSize: vw(20), lineHeight: vw(40) }}>
                  {topSubtitle}
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={`titles-${activeSlide}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} className="flex flex-col items-start">
                {/* Ghost gradient title */}
                <svg width="100%" style={{ height: vw(160), width: vw(1200), overflow: 'visible', marginBottom: vw(-10) }}>
                  <defs>
                    <linearGradient id={`grad-desk-${activeSlide}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#FFF195" />
                    </linearGradient>
                  </defs>
                  <text x="0" y="0" dominantBaseline="hanging" fill="transparent" stroke={`url(#grad-desk-${activeSlide})`} strokeWidth="2" className="font-jomhuria" style={{ fontSize: vw(200), paintOrder: "stroke fill" }}>
                    {slide.gradientTitle.split('\n').map((line, i) => (
                      <tspan x="0" dy={i === 0 ? "0" : "0.8em"} key={i}>{line}</tspan>
                    ))}
                  </text>
                </svg>
                
                {/* Gold main title */}
                <h1 className="font-jomhuria" style={{
                  fontSize: vw(128), lineHeight: 0.9, color: '#FFF17C',
                  width: vw(800),
                  filter: 'drop-shadow(0px 4px 12.6px rgba(86, 80, 32, 1))',
                  marginBottom: vw(90)
                }}>{slide.mainTitle}</h1>
                
                {/* Subtitle with vertical line */}
                <div className="flex">
                  <div style={{ width: vw(2), height: vw(144), backgroundColor: '#E6E0AA', flexShrink: 0, marginLeft: vw(41) }} />
                  <p className="font-jomhuria text-white uppercase" style={{
                    fontSize: vw(64), lineHeight: vw(48), width: vw(385), marginLeft: vw(38),
                    filter: 'drop-shadow(0px 4px 7.8px rgba(0,0,0,0.35))'
                  }}>
                    <span className="whitespace-pre-wrap">{slide.subtitle.replace(/\n\s*\n/g, '\n').replace(/\n/g, '\n')}</span>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* SEE ALL BUTTON - Dynamically populated from CMS, with perfect alignment to Group 237.svg */}
          <Link href={seeAllHref} className="group absolute" style={{ left: vw(1586), top: vw(106), zIndex: 7 }}>
            <div className="flex items-center">
              <div style={{ position: 'relative', width: vw(104), height: vw(104) }}>
                <div className="absolute inset-0 rounded-full border border-white group-hover:scale-110 group-hover:border-[#FFCC4A] transition-all" />
                <div className="absolute bg-[#FFCC4A] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: vw(12), height: vw(12) }} />
              </div>
              <span className="font-anaheim text-white uppercase group-hover:text-[#FFCC4A] transition-colors" style={{ fontSize: vw(24), marginLeft: vw(-25), letterSpacing: '0.05em' }}>
                {seeAllText}
              </span>
            </div>
          </Link>

          {/* VIEW MORE pill SVG */}
          <div className="absolute" style={{ left: vw(960), top: vw(1036), zIndex: 20 }}>
            {/* Make this button swap with image2 and next slide, similar logic to the box */}
            <ViewMoreButton onClick={() => swapAndNext(2)} text={bottomBoxText} />
          </div>
          
        </div>
      </div>

      {/* ============ MOBILE ============ */}
      <div className="block lg:hidden w-full px-6 pt-24 pb-16 bg-[#211C0B] min-h-screen">
        <div className="flex items-center mb-4">
          <span className="font-anaheim font-medium text-white text-sm uppercase tracking-widest">{title}</span>
          <div className="w-8 h-[1px] bg-white mx-3 rotate-[6.86deg]" />
          {topSubtitle && (
            <span className="font-anaheim font-medium text-white text-sm uppercase tracking-widest">{topSubtitle}</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.svg key={`mg-${activeSlide}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            width="100%" style={{ height: '80px', overflow: 'visible' }}>
            <defs>
              <linearGradient id={`grad-mob-${activeSlide}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFF195" />
              </linearGradient>
            </defs>
            <text x="0" y="0" dominantBaseline="hanging" fill="transparent" stroke={`url(#grad-mob-${activeSlide})`} strokeWidth="2" className="font-jomhuria text-[80px]" style={{ paintOrder: "stroke fill" }}>
              {slide.gradientTitle.split('\n').map((line, i) => (
                <tspan x="0" dy={i === 0 ? "0" : "0.8em"} key={i}>{line}</tspan>
              ))}
            </text>
          </motion.svg>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.h1 key={`mm-${activeSlide}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="font-jomhuria text-[#FFF17C] text-[52px] leading-[0.9] -mt-2 mb-4 w-[85%]">
            {slide.mainTitle}
          </motion.h1>
        </AnimatePresence>

        {/* Main image */}
        <div className="w-full aspect-[4/3] rounded-[30px] overflow-hidden mb-5 relative">
          <AnimatePresence mode="wait">
            <motion.div key={`mc-${displayImages[0]}`} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="absolute inset-0">
              {img(0) ? <OptimizedImage image={img(0) as any} alt="Hero" size="medium" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10" />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="w-[2px] self-stretch bg-[#E6E0AA] flex-shrink-0" />
          <AnimatePresence mode="wait">
            <motion.p key={`ms-${activeSlide}`} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="font-jomhuria text-white text-[30px] uppercase leading-[1.1]">
              {slide.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* 3 satellite images */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[1, 2, 3].map(slotIdx => (
            <button key={slotIdx} onClick={() => swapAndNext(slotIdx)} className="aspect-square rounded-xl overflow-hidden relative group">
              {img(slotIdx)
                ? <OptimizedImage image={img(slotIdx) as any} alt={`App ${slotIdx + 1}`} size="thumbnail" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-white/10" />}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <MagnifierIcon size={24} />
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button onClick={nextSlide} className="w-[180px] h-[50px] rounded-full bg-white/70 flex items-center justify-center">
            <span className="font-anaheim font-semibold text-[#756F3F] text-sm uppercase">{bottomBoxText}</span>
          </button>
          <Link href={seeAllHref} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white flex-shrink-0 relative">
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#FFCC4A] rounded-full" />
            </div>
            <span className="font-anaheim text-white text-lg uppercase">{locale === 'zh' ? '查看全部' : 'SEE ALL'}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
