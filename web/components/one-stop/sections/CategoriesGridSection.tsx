"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface Product {
  id: string
  name: string
  slug: string
  showImage?: { url: string }
  highlights?: string[]
  category?: {
    name?: string
    localizedName?: string
  }
}

interface CategoriesGridSectionProps {
  title?: string
  subtitle?: string
  products: Product[]
  locale: string
  loading: boolean
}

export function CategoriesGridSection({ title, subtitle, products, locale, loading }: CategoriesGridSectionProps) {
  if (loading) return null

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center" 
      style={{ 
        background: "linear-gradient(180deg, #EDE9C7 0%, #F6F4ED 100%)",
        paddingTop: "60px",
        paddingBottom: "80px"
      }}
    >
      {/* 70% Scale Container - Compensate for visual shrink with negative margin-bottom */}
      <div className="relative w-[1920px] origin-top flex flex-col items-center flex-shrink-0" 
        style={{ 
          transform: "scale(0.7)",
          marginBottom: "-540px" 
        }}
      >
        
        {/* Titles */}
        <div className="text-center mb-16 px-10">
          <h2 
            className="text-[96px] font-[900] leading-[128px] text-black" 
            style={{ fontFamily: "var(--font-anaheim)" }}
            dangerouslySetInnerHTML={{ __html: (title || "Product Related To").replace(/\n/g, '<br />') }}
          />
          <h3 className="text-[128px] font-[900] leading-[128px] mt-[-20px]" 
            style={{ 
              fontFamily: "var(--font-anaheim)",
              color: "#EEEACB",
              WebkitTextStroke: "4px #000000",
              paintOrder: "stroke fill"
            }}
          >
            {subtitle || "Busrom"}
          </h3>
        </div>

        {/* Grid of Products */}
        <div className="grid grid-cols-3 gap-x-[45px] gap-y-[71px] px-[153px] w-full">
          {products.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative w-[505px] h-[466px] group"
            >
              <Link href={`/${locale}/shop/${item.slug}`} className="block w-full h-full relative">
                {/* Background effect (Shape + Shadow) */}
                <div className="absolute inset-0 transition-all duration-300 group-hover:scale-105">
                  {/* Shadow layer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ filter: "drop-shadow(0 21px 25.6px rgba(0,0,0,0.25))" }}>
                    <svg viewBox="0 0 391 361" className="w-full h-full" preserveAspectRatio="none">
                      <path d="M300.447 0C318.599 0.000263884 333.314 14.7153 333.314 32.8672V37.1211C333.315 52.9239 346.125 65.7342 361.928 65.7344C377.731 65.7344 390.542 78.5456 390.542 94.3486V320.382C390.542 342.473 372.633 360.382 350.542 360.382H40C17.9087 360.382 0.000214435 342.473 0 320.382V40C0 17.9086 17.9086 0 40 0H300.447Z" fill="white"/>
                    </svg>
                  </div>
                  {/* Base Layer */}
                  <svg viewBox="0 0 391 361" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M300.447 0C318.599 0.000263884 333.314 14.7153 333.314 32.8672V37.1211C333.315 52.9239 346.125 65.7342 361.928 65.7344C377.731 65.7344 390.542 78.5456 390.542 94.3486V320.382C390.542 342.473 372.633 360.382 350.542 360.382H40C17.9087 360.382 0.000214435 342.473 0 320.382V40C0 17.9086 17.9086 0 40 0H300.447Z" fill="white"/>
                  </svg>
                </div>

                {/* Arrow Icon Button - Offset to match Figma spec (-14px top, -23px right) */}
                <div className="absolute top-[-14px] right-[-23px] w-[87px] h-[87px] z-40">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg group-hover:bg-[#756F3F] transition-colors duration-300">
                    <svg width="36" height="46" viewBox="0 0 36 46" fill="none">
                      <path d="M32.2538 14.6234L32.2388 14.6121C32.0365 14.465 31.7941 14.3832 31.5441 14.3776L31.5295 14.3774L31.5336 14.3777C31.4378 14.3709 31.3417 14.3735 31.2465 14.3854L31.2195 14.389L18.9035 16.1492C18.097 16.2645 17.5373 17.0117 17.6536 17.8181L17.6573 17.8422C17.7848 18.6355 18.5257 19.1833 19.3241 19.0692L28.3515 17.7789L16.4249 33.7031C16.0176 34.247 16.1288 35.0184 16.6732 35.4261L16.8112 35.5295C17.3547 35.9227 18.1149 35.8093 18.5181 35.2709L30.4447 19.3466L31.7458 28.3725C31.862 29.1788 32.6098 29.7389 33.4163 29.6237C34.2228 29.5084 34.7824 28.7612 34.6662 27.9549L32.891 15.6399L32.887 15.6141C32.873 15.528 32.8515 15.4433 32.8226 15.361L32.8151 15.3402L32.8163 15.3442C32.7406 15.0924 32.586 14.8716 32.3753 14.7143L32.2538 14.6234Z" fill="#5E573F" className="group-hover:fill-white transition-colors" />
                    </svg>
                  </div>
                </div>

                {/* Text Content - Higher Z-index */}
                <div className="absolute left-[57px] top-[32px] w-[337px] z-30">
                   <h4 className="text-[40px] font-extrabold text-black leading-[1.1] mb-2" style={{ fontFamily: "var(--font-anaheim)" }}>
                     {/* 如果有明确的 _carouselItem 开关，听开关的；否则，优先显示分类名 */}
                     {(item as any)._carouselItem 
                       ? ((item as any)._carouselItem.showName === false ? (item.category?.name || item.name) : item.name)
                       : (item.category?.name || item.name)}
                   </h4>
                </div>

                {/* Main Product Image (Show Image / White Backdrop) */}
                <div className="absolute inset-0 flex items-center justify-center pt-[80px] z-10">
                  <div className="w-[85%] h-[85%] relative">
                  {item.showImage && (
                    <OptimizedImage 
                      image={item.showImage as any} 
                      alt={item.name}
                      size="small"
                      className="w-full h-full object-contain"
                    />
                  )}
                  </div>
                </div>

              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
