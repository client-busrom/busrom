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
            className="text-[96px] font-anaheim font-extrabold leading-[128px] text-black" 
            style={{ 
              WebkitTextStroke: "4px #000000",
              paintOrder: "stroke fill"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "Product Related To").replace(/\n/g, '<br />') }}
          />
          <h3 className="text-[128px] font-anaheim font-extrabold leading-[128px] mt-[-20px]" 
            style={{ 
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

                {/* Arrow Icon Button - Pop-out Translation Support (Fixed Group Nesting) */}
                <div className="absolute top-[-14px] right-[-23px] w-[87px] h-[87px] z-40 cursor-pointer group-hover:translate-x-[7px] group-hover:translate-y-[-7px] transition-all duration-300">
                  {/* Default State SVG (64x64) scaled to container */}
                  <div className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="32" fill="white"/>
                      <path d="M41.7069 18.9091L41.6874 18.8946C41.4258 18.7044 41.1124 18.5986 40.7891 18.5914L40.7702 18.591L40.7755 18.5914C40.6517 18.5827 40.5274 18.586 40.4043 18.6014L40.3694 18.606L24.4438 20.8822C23.401 21.0312 22.6773 21.9974 22.8276 23.0401L22.8324 23.0713C22.9973 24.0971 23.9554 24.8055 24.9877 24.6579L36.6608 22.9895L21.2389 43.5807C20.7122 44.2839 20.856 45.2814 21.5599 45.8086L21.7384 45.9423C22.4412 46.4508 23.4241 46.3041 23.9456 45.6079L39.3675 25.0167L41.0499 36.6878C41.2001 37.7304 42.1672 38.4547 43.21 38.3056C44.2528 38.1566 44.9765 37.1905 44.8262 36.1478L42.5307 20.2236L42.5256 20.1902C42.5075 20.0789 42.4796 19.9694 42.4423 19.863L42.4326 19.836L42.4342 19.8412C42.3362 19.5157 42.1363 19.2302 41.8639 19.0267L41.7069 18.9091Z" fill="#5E571F"/>
                    </svg>
                  </div>

                  {/* Active/Hover State SVG (128x128) - Offset to center over button */}
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ left: "-12.5px", top: "-28.5px", width: "128px", height: "128px" }}>
                    <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g filter="url(#filter0_d_258_2_fixed)">
                        <circle cx="63.7" cy="55.7002" r="43.5" fill="#756F3F"/>
                      </g>
                      <path d="M76.8953 37.9048L76.8689 37.885C76.5133 37.6265 76.0872 37.4827 75.6477 37.4728L75.6221 37.4724L75.6292 37.4729C75.4609 37.4611 75.292 37.4656 75.1246 37.4864L75.0772 37.4928L53.4283 40.5869C52.0107 40.7895 51.027 42.1029 51.2313 43.5204L51.2378 43.5628C51.462 44.9572 52.7644 45.9201 54.1676 45.7196L70.0358 43.4516L49.0716 71.4427C48.3557 72.3986 48.5512 73.7546 49.508 74.4712L49.7507 74.653C50.706 75.3442 52.0422 75.1448 52.751 74.1984L73.7152 46.2072L76.0022 62.0727C76.2065 63.49 77.521 64.4745 78.9386 64.2719C80.3562 64.0694 81.3399 62.756 81.1357 61.3385L78.0152 39.6917L78.0083 39.6462C77.9837 39.4949 77.9458 39.3461 77.895 39.2014L77.8818 39.1648L77.884 39.1719C77.7508 38.7293 77.4791 38.3412 77.1088 38.0647L76.8953 37.9048Z" fill="white"/>
                      <defs>
                        <filter id="filter0_d_258_2_fixed" x="1.14441e-05" y="0.00019455" width="127.4" height="127.4" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                          <feOffset dy="8"/>
                          <feGaussianBlur stdDeviation="10.1"/>
                          <feComposite in2="hardAlpha" operator="out"/>
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_258_2"/>
                          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_258_2" result="shape"/>
                        </filter>
                      </defs>
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
