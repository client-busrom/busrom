"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface Product {
  id: string
  name: string
  slug: string
  productAttributes?: string | string[]
  mainImage?: any[]
  showImage?: any
}

interface ProductSeriesShowcaseSectionProps {
  title?: string
  products: Product[]
  locale: string
}

export function ProductSeriesShowcaseSection({ title, products, locale }: ProductSeriesShowcaseSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // 仅获取有足够图片的或有效的产品
  const validProducts = useMemo(() => {
    return products.filter(p => p.name && p.slug)
  }, [products])

  if (validProducts.length === 0) return null

  const activeProduct = validProducts[currentIndex]

  // 从 mainImage 中随机选两张图片，如果没有则用占位图或展示图
  const displayedImages = useMemo(() => {
    const images = activeProduct.mainImage && activeProduct.mainImage.length > 0 
      ? [...activeProduct.mainImage] 
      : (activeProduct.showImage ? [activeProduct.showImage] : [])
    
    if (images.length === 0) return [null, null]
    if (images.length === 1) return [images[0], images[0]]
    
    // 简单打乱选前两个
    const shuffled = images.sort(() => 0.5 - Math.random())
    return [shuffled[0], shuffled[1]]
  }, [activeProduct])

  // 处理属性展示
  const attributes = useMemo(() => {
    if (Array.isArray(activeProduct.productAttributes)) return activeProduct.productAttributes
    if (typeof activeProduct.productAttributes === 'string') {
        return activeProduct.productAttributes.split('\n').filter(line => line.trim())
    }
    return ["Robust and stable", "Resistant to moisture", "Minimalist aesthetics", "Versatile and adaptable"]
  }, [activeProduct])

  const nextProduct = () => setCurrentIndex((prev) => (prev + 1) % validProducts.length)
  const prevProduct = () => setCurrentIndex((prev) => (prev - 1 + validProducts.length) % validProducts.length)

  return (
    <section className="relative w-full overflow-hidden bg-[#F9F9F5] flex justify-center items-center" style={{ height: "922px" }}>
      
      {/* 70% Scale Container */}
      <div 
        className="relative w-[1920px] h-[922px] origin-center flex-shrink-0"
        style={{ transform: "scale(0.7)" }}
      >
        
        {/* 1. Base Title Layer (Outside - #F6F4ED) */}
        <div className="absolute left-[95px] top-[66px] z-10">
          <h2 
            className="text-[120px] font-[900] leading-[116px] pointer-events-none"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              color: "#F6F4ED",
              WebkitTextStroke: "4px #846500",
              paintOrder: "stroke fill",
              opacity: 1
            }}
            dangerouslySetInnerHTML={{ __html: (title || "Product Series").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 2. Navigation Arrows */}
        <div className="absolute right-[163px] top-[120px] flex gap-[77px] z-30">
           {/* Prev */}
           <button 
             onClick={prevProduct}
             className="w-[74px] h-[74px] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white shadow-lg hover:bg-[#756F3F] hover:text-white transition-all group"
           >
              <svg width="17" height="29" viewBox="0 0 17 29" fill="none" className="group-hover:fill-white">
                <path d="M15.5 2L3 14.5L15.5 27" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
           </button>
           {/* Next */}
           <button 
             onClick={nextProduct}
             className="w-[74px] h-[74px] rounded-full bg-[#756F3F] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
           >
              <svg width="17" height="29" viewBox="0 0 17 29" fill="none">
                <path d="M1.5 2L14 14.5L1.5 27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
           </button>
        </div>

        {/* 3. Masked Title Layer (Inside Card - #F1E8CA) */}
        <div 
          className="absolute left-[153px] top-[262px] w-[766px] h-[561px] rounded-[30px] overflow-hidden pointer-events-none z-[15]"
        >
           <div className="absolute left-[-58px] top-[-196px]">
             <h2 
                className="text-[120px] font-[900] leading-[116px]"
                style={{ 
                  fontFamily: "var(--font-anaheim)",
                  color: "#F1E8CA",
                  WebkitTextStroke: "4px #846500",
                  paintOrder: "stroke fill",
                  opacity: 1
                }}
                dangerouslySetInnerHTML={{ __html: (title || "Product Series").replace(/\n/g, '<br />') }}
              />
           </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeProduct.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* 3. Left Beige Content Card (Rectangle 290) */}
            <div 
              className="absolute left-[153px] top-[262px] w-[766px] h-[561px] rounded-[30px] bg-[#F1E8CA] p-[90px] pt-[90px] flex flex-col"
              style={{ boxShadow: "0 21px 25.6px rgba(0,0,0,0.05)" }}
            >
              {/* Product Name / Category Name */}
              <h3 
                className="text-[64px] font-[800] text-[#6D5400] leading-[1] mb-[30px]"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {(activeProduct as any)._carouselItem 
                  ? ((activeProduct as any)._carouselItem.showName === false ? ((activeProduct as any).category?.name || activeProduct.name) : activeProduct.name)
                  : ((activeProduct as any).category?.name || activeProduct.name)}
              </h3>

              {/* Attributes List */}
              <div className="flex flex-col gap-5">
                {attributes.slice(0, 4).map((attr, i) => (
                  <div key={i} className="flex items-center gap-[19px]">
                    {/* Checkmark Icon */}
                    <div className="w-[36px] h-[36px] rounded-full bg-[#A5A075] flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                        <path d="M1.5 7L6.5 12L16.5 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-[24px] font-semibold text-black leading-[28px]" style={{ fontFamily: "var(--font-anaheim)" }}>
                      {attr}
                    </p>
                  </div>
                ))}
              </div>

              {/* SEE ALL Link */}
              <div className="mt-auto self-end">
                <Link 
                  href={`/${locale}/shop/${activeProduct.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <span 
                    className="text-[22px] font-semibold text-[#756F3F] transition-colors group-hover:text-black"
                    style={{ fontFamily: "var(--font-anaheim)" }}
                  >
                    SEE ALL
                  </span>
                  <div className="w-[57px] h-[57px] rounded-full border border-[#756F3F] flex items-center justify-center group-hover:bg-[#756F3F] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:stroke-white transition-colors">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* 4. Right Image 1 (Rectangle 291) */}
            <div className="absolute left-[972px] top-[262px] w-[375px] h-[561px] rounded-[30px] overflow-hidden shadow-xl">
               <OptimizedImage 
                 image={displayedImages[0]} 
                 alt="Attribute 1"
                 className="w-full h-full object-cover"
                 containerClassName="w-full h-full"
                 size="medium"
               />
            </div>

            {/* 5. Right Image 2 (Rectangle 292) */}
            <div className="absolute left-[1382px] top-[262px] w-[375px] h-[561px] rounded-[30px] overflow-hidden shadow-xl">
               <OptimizedImage 
                 image={displayedImages[1]} 
                 alt="Attribute 2"
                 className="w-full h-full object-cover"
                 containerClassName="w-full h-full"
                 size="medium"
               />
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
