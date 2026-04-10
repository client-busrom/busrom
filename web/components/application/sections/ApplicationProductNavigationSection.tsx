"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

function vw(px: number) {
  return `${(px / 1920) * 100}vw`
}

// Scale toggle requested by UI to shrink items. Reverted base scale to 1 because we are now scaling the entire group wrapper by 0.54
const SCALE = 1
const svw = (px: number) => vw(px * SCALE)

const calcSlot = (left: number, top: number, width: number, height: number) => ({
  left: vw(left + (width - width * SCALE) / 2),
  top: vw(top + (height - height * SCALE) / 2),
  width: vw(width * SCALE),
  height: vw(height * SCALE)
})

const calcLetter = (left: number, top: number, width: number, height: number, zIndex?: number) => {
  const CENTER_X = 957.5; // absolute horizontal center of the carousel slots
  const CENTER_Y = 683;   // absolute vertical center of the carousel slots
  const distScale = SCALE; // pull letters proportionally closer to center
  const sizeScale = Math.max(0.8, SCALE); // slightly scale letters, but don't shrink below 0.8
  
  const cx = left + width / 2;
  const cy = top + height / 2;
  
  const newCx = CENTER_X + (cx - CENTER_X) * distScale;
  const newCy = CENTER_Y + (cy - CENTER_Y) * distScale;
  const newW = width * sizeScale;
  const newH = height * sizeScale;
  
  const style: React.CSSProperties = {
    left: vw(newCx - newW / 2),
    top: vw(newCy - newH / 2),
    width: vw(newW),
    height: vw(newH),
  };
  
  if (zIndex !== undefined) style.zIndex = zIndex;
  return style;
}

interface SlotConfig {
  left: string;
  top: string;
  width: string;
  height: string;
  zIndex: number;
  bgColor?: string;
  borderColor?: string;
  dropShadow?: string;
}

// Same as the one configured in Figma, but scaled dynamically
const SLOTS: SlotConfig[] = [
  // Slot 0 (Far Left)
  { ...calcSlot(135, 1468 - 1404, 919, 742), zIndex: 2, bgColor: 'rgba(199, 182, 141, 0.52)' },
  // Slot 1 (Mid Left)
  { ...calcSlot(259, 1544 - 1404, 919, 742), zIndex: 4, bgColor: 'rgba(216, 205, 177, 0.42)' },
  // Slot 2 (Center)
  { ...calcSlot(376, 1617 - 1404, 1163, 940), zIndex: 10, borderColor: '#C5BD7E', dropShadow: '24px 22px 51.2px rgba(0,0,0,0.25)' },
  // Slot 3 (Mid Right)
  { ...calcSlot(734, 1878 - 1404, 919, 742), zIndex: 4, bgColor: 'rgba(161, 133, 61, 0.28)' },
  // Slot 4 (Far Right)
  { ...calcSlot(845, 1946 - 1404, 919, 742), zIndex: 2,  bgColor: 'rgba(177, 162, 125, 0.63)' },
]

export interface ApplicationProductNavigationSectionProps {
  carouselItems: any[]
  ctaText?: string
  ctaHref?: string
  locale: string
}

export function ApplicationProductNavigationSection({
  carouselItems = [],
  ctaText = "VIEW MORE",
  ctaHref = "/cases",
  locale
}: ApplicationProductNavigationSectionProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0) // tracks which index is the Center (slot 2)

  useEffect(() => {
    if (!carouselItems || carouselItems.length === 0) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/carousel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: carouselItems, locale })
        })
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error('Failed to fetch carousel products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [carouselItems, locale])

  // Automatically cycle (like autoplay in CMS, interval=5s)
  useEffect(() => {
    if (products.length <= 1) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [products.length, activeIndex])

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % products.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const handleManualSwap = (targetSlot: number) => {
    // If they clicked slot 0, it means go back 2 steps
    // Target slot 2 is center. Difference:
    const diff = targetSlot - 2
    setActiveIndex((prev) => (prev + diff + products.length) % products.length)
  }

  // To map products cleanly into 5 slots based on activeIndex
  // [active-2, active-1, active, active+1, active+2]
  const displayItems = () => {
    if (products.length === 0) return []
    // If we have fewer than 5 products, we repeat them safely modulus
    const len = products.length
    return [
      (activeIndex - 2 + len * 2) % len,
      (activeIndex - 1 + len * 2) % len,
      activeIndex,
      (activeIndex + 1) % len,
      (activeIndex + 2) % len
    ]
  }

  const indices = displayItems()

  if (loading) return <div className="w-full h-[50vh] flex items-center justify-center">Loading Products...</div>
  if (products.length === 0) return null

  return (
    <section className="relative w-full overflow-hidden select-none bg-transparent" style={{ height: vw(922) }}>
      {/* 1920 container to host exact coordinates */}
      <div className="absolute left-1/2 -translate-x-1/2 h-full" style={{ width: vw(1920) }}>
        
        {/* ================== CTA TOP RIGHT ================== */}
        <div className="absolute" style={{ left: vw(1486), top: vw(80), zIndex: 20 }}>
          <Link href={ctaHref || "/cases"} className="flex items-center group">
            <span className="font-anaheim font-semibold text-black uppercase group-hover:opacity-80 transition-opacity" style={{ fontSize: vw(32), lineHeight: vw(30), marginRight: vw(18) }}>
              {ctaText}
            </span>
            <div className="relative flex items-center justify-center group-hover:opacity-80 transition-opacity" style={{ width: vw(102), height: vw(66), backgroundColor: '#756F3F', borderRadius: vw(33) }}>
              <div style={{ width: vw(33), height: vw(18) }}>
                <svg viewBox="0 0 33 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M24 1L31.5 8.5M31.5 8.5L24 16M31.5 8.5H1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* ================== SCALED GROUP (LETTERS, SLOTS, ARROWS) ================== */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ transform: 'scale(0.54)', transformOrigin: 'center center', marginTop: vw(-120) }}
        >
          {/* We make inner elements pointer-events-auto if they need to be interactive */}
          <div className="relative w-full h-full pointer-events-auto">

            {/* ================== BACKGROUND LETTERS ================== */}
            <div className="absolute pointer-events-none" style={calcLetter(1019, -37, 116, 143)}>
              <Image src="/images/application/letters/r.svg" alt="R" fill />
            </div>
            
            <div className="absolute pointer-events-none" style={calcLetter(1453, 156, 127, 141, 15)}>
              <Image src="/images/application/letters/o.svg" alt="O" fill />
            </div>

            <div className="absolute pointer-events-none" style={calcLetter(1704, 505, 160, 144, 3)}>
              <Image src="/images/application/letters/m.svg" alt="M" fill />
            </div>

            <div className="absolute pointer-events-none" style={calcLetter(36, 548, 132, 191, 3)}>
              <Image src="/images/application/letters/b.svg" alt="B" fill />
            </div>

            <div className="absolute pointer-events-none" style={calcLetter(291, 1018, 108, 141, 15)}>
              <Image src="/images/application/letters/u.svg" alt="U" fill />
            </div>

            <div className="absolute pointer-events-none" style={calcLetter(706, 1124, 98, 142)}>
              <Image src="/images/application/letters/s.svg" alt="S" fill />
            </div>

            {/* ================== CAROUSEL SLOTS ================== */}
            {indices.map((productIdx, slotIdx) => {
              const slot = SLOTS[slotIdx]
              const product = products[productIdx]
              
              if (!product) return null

              const isCenter = slotIdx === 2
              
              return (
                <motion.div
                  layout
                  key={`nav-product-${productIdx}`}
                  initial={false}
                  animate={{
                    left: slot.left,
                    top: slot.top,
                    width: slot.width,
                    height: slot.height,
                    zIndex: slot.zIndex,
                    boxShadow: slot.dropShadow || 'none',
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  onClick={() => {
                    if (!isCenter) {
                      handleManualSwap(slotIdx)
                    } else {
                      const slug = product.slug || product.id
                      const url = `/${locale}/shop/${slug}`
                      if (product._carouselItem?.openInNewTab) {
                        window.open(url, '_blank')
                      } else {
                        window.location.href = url
                      }
                    }
                  }}
                  className="absolute overflow-hidden group cursor-pointer"
                  style={{
                    borderRadius: vw(60 * SCALE),
                    border: slot.borderColor ? `2px solid ${slot.borderColor}` : 'none',
                  }}
                >
                  <div className="relative w-full h-full bg-stone-200">
                    {product.showImage?.url ? (
                      <Image 
                        src={product.showImage.url} 
                        alt={product.name || "Product"} 
                        fill 
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-200" />
                    )}
                    
                    {!isCenter && slot.bgColor && (
                      <motion.div 
                        layout
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-80"
                        style={{ backgroundColor: slot.bgColor }}
                      />
                    )}

                    {isCenter && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute flex items-center justify-center rounded-full border border-white/50" style={{ right: svw(40), top: svw(40), width: svw(156), height: svw(156), backgroundColor: '#756F3F' }}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: svw(64), height: svw(64) }}>
                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>

                        <div className="absolute bottom-0 w-full flex flex-col justify-center" style={{ 
                          height: svw(304),
                          backgroundColor: 'rgba(117, 111, 63, 0.74)',
                          backdropFilter: 'blur(20px)',
                          paddingLeft: svw(72),
                          paddingRight: svw(72)
                        }}>
                          {product._carouselItem?.showName !== false && (
                            <h3 className="font-anaheim font-bold text-white truncate" style={{ fontSize: svw(64), lineHeight: 1.1, marginBottom: svw(16) }}>
                              {product.name}
                            </h3>
                          )}
                          {product._carouselItem?.showHighlights !== false && (
                            <div className="flex flex-col gap-[10px]">
                              {(product.productAttributes?.highlights?.length > 0 
                                ? product.productAttributes.highlights 
                                : [{ text: "Premium Material" }, { text: "Customized Service" }, { text: "Durability Guaranteed" }]
                              )
                                .slice(0, product._carouselItem?.highlightsCount || 3)
                                .map((h: any, idx: number) => (
                                <div key={idx} className="flex items-center">
                                  <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: svw(18), height: svw(18), marginRight: svw(24) }}>
                                    <div className="absolute inset-0 rounded-full border" style={{ borderColor: '#E4DDA9' }} />
                                    <div className="rounded-full" style={{ width: svw(10), height: svw(10), backgroundColor: '#FFE866' }} />
                                  </div>
                                  <span className="font-anaheim font-semibold text-white line-clamp-1" style={{ fontSize: svw(32), lineHeight: 1.2 }}>
                                    {h.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}

            {/* ================== ARROWS ================== */}
            <button className="absolute hover:scale-105 transition-transform" style={{ left: vw(311), top: vw(334), width: vw(200), height: vw(152), zIndex: 20 }} onClick={prevSlide}>
              <Image src="/images/application/letters/leftarrow.svg" alt="Prev" fill />
            </button>

            <button className="absolute hover:scale-105 transition-transform" style={{ left: vw(1408), top: vw(917), width: vw(200), height: vw(152), zIndex: 20 }} onClick={nextSlide}>
              <Image src="/images/application/letters/rightarrow.svg" alt="Next" fill />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
