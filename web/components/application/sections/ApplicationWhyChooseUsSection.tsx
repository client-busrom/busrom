"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

function vw(px: number) {
  return `${(px / 1920) * 100}vw`
}

export interface WhyChooseUsItemPart {
  text: string
  bold?: boolean
}

export interface WhyChooseUsItem {
  id: string
  number: string
  title: string
  description: string
  descriptionParts?: WhyChooseUsItemPart[]
  imageLeft: string
  imageRight: string
}

interface ApplicationWhyChooseUsSectionProps {
  items?: WhyChooseUsItem[]
}

const defaultItems: WhyChooseUsItem[] = [
  {
    id: "1",
    number: "01",
    title: "Customized Engineering Solutions",
    description: "Dimensions, Materials, And Surface Treatments Can Be Selected According To Project Requirements To Achieve A Customized Solution For Each Project.",
    imageLeft: "/images/application/work.jpg",
    imageRight: "/images/application/engineer.jpg"
  }
]

export function ApplicationWhyChooseUsSection({ items = defaultItems }: ApplicationWhyChooseUsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentItem = items[currentIndex % items.length]

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length)
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)

  return (
    <section className="relative w-full overflow-hidden select-none" style={{ height: vw(1025) }}>
      <div className="absolute left-1/2 -translate-x-1/2 h-full" style={{ width: vw(1920) }}>
        
        {/* Left Gradient Box & Clipped "Why" Title */}
        {/* Rectangle 402: x=0, y=3, w=550, h=1022 */}
        <div className="absolute overflow-hidden" style={{ left: 0, top: vw(3), width: vw(550), height: vw(1022), zIndex: 5 }}>
          {/* Gradient Background */}
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'linear-gradient(165deg, #6E6731 0%, #D4C75F 100%)'
            }} 
          />
          
          {/* Why Title (White Stroke version - Clipped by this container) */}
          <h3 
            className="absolute font-extrabold whitespace-nowrap"
            style={{ 
              left: vw(497 + 20), 
              top: vw(-63), // Target global -60px (60 + 3 container offset)
              fontSize: vw(160), 
              fontFamily: 'var(--font-anaheim), sans-serif',
              color: 'transparent',
              WebkitTextStroke: `${vw(1.5)} #FFFFFF`
            }}
          >
            Why
          </h3>
        </div>

        {/* Olive Stroke "Why" Title (Outside the box) */}
        <h3 
          className="absolute font-extrabold whitespace-nowrap"
          style={{ 
            left: vw(497 + 20), 
            top: vw(-60), 
            fontSize: vw(160), 
            fontFamily: 'var(--font-anaheim), sans-serif',
            color: 'transparent',
            WebkitTextStroke: `${vw(1.5)} #756F3F`,
            zIndex: 2
          }}
        >
          Why
        </h3>

        {/* contractors choose us? Header */}
        <h4 
          className="absolute font-extrabold"
          style={{ 
            left: vw(726), 
            top: vw(35), 
            fontSize: vw(77), // 96 * 0.8
            lineHeight: vw(82),
            fontFamily: 'var(--font-anaheim), sans-serif',
            color: '#756F3F',
            zIndex: 10
          }}
        >
          contractors choose us?
        </h4>

        {/* Carousel Content Area */}
        {/* Rectangle 404: x=550, y=123, w=1370, h=902 */}
        <div className="absolute" style={{ left: vw(550), top: vw(123), width: vw(1370), height: vw(902), backgroundColor: '#A59E69', zIndex: 1 }}>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {/* Item Title (Black Han Sans with offset effect) */}
              <div 
                className="absolute" 
                style={{ 
                  left: vw(807 - 550), 
                  top: vw(343 - 110),
                  width: vw(1200) // Explicitly set width to prevent inconsistent wrapping
                }}
              >
                {/* Shadow layer */}
                <h5 
                  className="absolute whitespace-pre text-left"
                  style={{ 
                    left: vw(2), 
                    top: vw(10), 
                    fontSize: vw(56), 
                    fontFamily: 'var(--font-black-han-sans), sans-serif',
                    color: '#766900',
                    lineHeight: vw(67),
                    width: '100%'
                  }}
                >
                  {currentItem.title}
                </h5>
                {/* Main layer */}
                <h5 
                  className="relative whitespace-pre text-left"
                  style={{ 
                    fontSize: vw(56), 
                    fontFamily: 'var(--font-black-han-sans), sans-serif',
                    color: '#FFF6B1',
                    lineHeight: vw(67),
                    width: '100%'
                  }}
                >
                  {currentItem.title}
                </h5>
              </div>

              {/* Item Number & Line */}
              <div className="absolute flex items-center" style={{ left: vw(812 - 550), top: vw(820 - 123) }}>
                <span 
                  style={{ 
                    fontSize: vw(102), // 128 * 0.8
                    fontFamily: 'var(--font-anaheim), sans-serif', 
                    fontWeight: 'bold',
                    color: '#544D0F'
                  }}
                >
                  {currentItem.number}
                </span>
                <div 
                  className="ml-6" 
                  style={{ width: vw(234), height: vw(2), backgroundColor: '#544D0F' }} 
                />
              </div>

              {/* Item Description */}
              <p 
                className="absolute text-black"
                style={{ 
                  left: vw(812 - 550), 
                  top: vw(500 - 123), 
                  width: vw(700), 
                  fontSize: vw(29), 
                  lineHeight: vw(46),
                  fontFamily: 'var(--font-anaheim), sans-serif'
                }}
              >
                {currentItem.descriptionParts ? (
                  currentItem.descriptionParts.map((part, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        color: part.bold ? '#FFEE53' : 'inherit',
                        fontWeight: part.bold ? 'bold' : 'normal'
                      }}
                    >
                      {part.text}
                    </span>
                  ))
                ) : currentItem.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="absolute flex flex-col gap-4" style={{ left: vw(1725 - 550), top: vw(424 - 123), zIndex: 50 }}>
            <button 
              onClick={handlePrev}
              className="rounded-full border border-white/60 flex items-center justify-center bg-white/20 hover:bg-white/40 transition-colors"
              style={{ width: vw(50), height: vw(50) }}
            >
              <svg viewBox="0 0 14 24" fill="none" className="rotate-180" style={{ width: vw(11), height: vw(19) }}>
                <path d="M1 23L12 12L1 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={handleNext}
              className="rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
              style={{ width: vw(50), height: vw(50) }}
            >
              <svg viewBox="0 0 14 24" fill="none" style={{ width: vw(11), height: vw(19) }}>
                <path d="M1 23L12 12L1 1" stroke="#A59E69" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

        </div>

        {/* Global Floating Images (Linked to current item) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`imgs-${currentItem.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            {/* Rectangle 403 - Left Large Image (Leaf shape: TL and BR rounded) */}
            <div 
              className="absolute overflow-hidden" 
              style={{ 
                left: vw(176 + 55), // Shifted to look better with 100% box
                top: vw(123 + 80), 
                width: vw(440), // 550 * 0.8
                height: vw(634), // 793 * 0.8
                borderRadius: `${vw(147)} 0 ${vw(147)} 0`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                zIndex: 40
              }}
            >
              <Image src={currentItem.imageLeft} alt="solution-left" fill className="object-cover" unoptimized />
            </div>

            {/* Rectangle 405 - Right Small Image (Rounded bottom-left) */}
            <div 
              className="absolute overflow-hidden" 
              style={{ 
                right: 0, 
                top: vw(700 + 40), 
                width: vw(440), 
                height: vw(173), 
                borderRadius: `0 0 0 ${vw(147)}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                zIndex: 40
              }}
            >
              <Image src={currentItem.imageRight} alt="solution-right" fill className="object-cover" unoptimized />
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
