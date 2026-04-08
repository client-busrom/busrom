"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ArrowUpRight } from "lucide-react"

// Viewport width conversion utility based on 1920px design width
const vw = (px: number) => `${(px / 1920) * 100}vw`

interface Product {
  id: string
  name: string
  slug: string
  showImage?: { url: string }
  image?: { url: string }
  category?: {
    name?: string
  }
}

interface CategoriesGridSectionProps {
  title?: string
  subtitle?: string
  products: Product[]
  locale: string
  loading: boolean
}

export function CategoriesGridSection({ 
  title, 
  subtitle, 
  products, 
  locale, 
  loading 
}: CategoriesGridSectionProps) {
  if (loading) return null

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center" 
      style={{ 
        background: "linear-gradient(180deg, #EDE9C7 0%, #F6F4ED 100%)",
        paddingTop: "clamp(48px, 4.73vw, 91px)", 
        paddingBottom: "clamp(48px, 4.73vw, 91px)" 
      }}
    >
      <div className="w-full max-w-[1300px] px-6 mx-auto flex flex-col items-center">
        {/* Titles */}
        <div className="text-center mb-10 lg:mb-[3.64vw]">
          <h2 
            className="font-anaheim font-extrabold text-black text-[32px] lg:text-[3.48vw] outline-1 lg:outline-2" 
            style={{ 
              lineHeight: 1.15,
              WebkitTextStroke: "1.5px #000000",
              // Media query for desktop stroke (overriding common style)
              paintOrder: "stroke fill"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "Product Related To").replace(/\n/g, '<br />') }}
          />
          {/* Using a wrapper to handle the complex stroke change via CSS and responsive margin */}
          <h3 
            className="font-anaheim font-extrabold text-[42px] lg:text-[4.68vw] 
                       mt-[-8px] lg:mt-[-0.73vw]" 
            style={{ 
              lineHeight: 1,
              color: "#EEEACB",
              WebkitTextStroke: "1.5px #000000", 
              paintOrder: "stroke fill"
            }}
          >
            {subtitle || "BEST SELLER"}
          </h3>
        </div>
 
        {/* Grid of Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6 lg:gap-[1.66vw]">
          {products.map((item, index) => (
            <Link 
              key={item.id} 
              href={`/${locale}/shop/${item.slug}`} 
              className="relative block w-full aspect-[1/0.72] lg:aspect-[1/0.92]"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                animate={{ filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" }}
                whileHover={{ 
                  scale: 1.02,
                  filter: `drop-shadow(0 ${vw(21)} ${vw(24)} rgba(0, 0, 0, 0.5))`
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
                className="absolute inset-0 group p-5 lg:p-[1.45vw]"
              >
                {/* SVG Background Shape */}
                <div className="absolute inset-0 z-0">
                  <svg viewBox="0 0 505 466" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M391 0C413.091 0 431 17.9086 431 40V48C431 68.1152 447.052 84.4817 467.045 84.9883L468.955 85.0117C488.948 85.5183 505 101.885 505 122V426C505 448.091 487.091 466 465 466H40C17.9086 466 0 448.091 0 426V40C0 17.9086 17.9086 0 40 0H391Z" fill="white"/>
                  </svg>
                </div>
 
                {/* Arrow Icon Button - Proportional to SVG Cutout (Fully Reactive) */}
                <div 
                  className="absolute z-40 transition-all duration-300 group-hover:translate-x-[5px] group-hover:translate-y-[-5px] group-hover:scale-110 
                             top-[-2%] right-[-2%] w-[12.1%] h-[12.1%] 
                             lg:top-[-0.52vw] lg:right-[-0.52vw] lg:w-[3.17vw] lg:h-[3.17vw]"
                >
                  <svg width="100%" height="100%" viewBox="0 0 61 61" fill="none">
                    <circle cx="30.5" cy="30.5" r="30.5" fill="white" className="transition-colors duration-300 group-hover:fill-[#756F3F] shadow-sm"/>
                    <path d="M41.7069 18.9091L41.6874 18.8946C41.4258 18.7044 41.1124 18.5986 40.7891 18.5914L40.7702 18.591L40.7755 18.5914C40.6517 18.5827 40.5274 18.586 40.4043 18.6014L40.3694 18.606L24.4438 20.8822C23.401 21.0312 22.6773 21.9974 22.8276 23.0401L22.8324 23.0713C22.9973 24.0971 23.9554 24.8055 24.9877 24.6579L36.6608 22.9895L21.2389 43.5807C20.7122 44.2839 20.856 45.2814 21.5599 45.8086L21.7384 45.9423C22.4412 46.4508 23.4241 46.3041 23.9456 45.6079L39.3675 25.0167L41.0499 36.6878C41.2001 37.7304 42.1672 38.4547 43.21 38.3056C44.2528 38.1566 44.9765 37.1905 44.8262 36.1478L42.5307 20.2236L42.5256 20.1902C42.5075 20.0789 42.4796 19.9694 42.4423 19.863L42.4326 19.836L42.4342 19.8412C42.3362 19.5157 42.1363 19.2302 41.8639 19.0267L41.7069 18.9091Z" fill="#5E571F" className="transition-colors duration-300 group-hover:fill-white"/>
                  </svg>
                </div>
 
                {/* Text Content */}
                <div 
                  className="absolute z-30 left-6 top-[22px] w-[80%] lg:left-[2.08vw] lg:top-[1.14vw] lg:w-[13.54vw]" 
                >
                  <h4 className="font-montserrat font-regular group-hover:font-extrabold text-black text-[18px] lg:text-[1.51vw] leading-[1.25] transition-all duration-300">
                    {(item as any).title || item.category?.name || item.name}
                  </h4>
                </div>
 
                {/* Product Image */}
                <div 
                  className="absolute inset-0 flex items-end justify-center z-10 overflow-hidden"
                  style={{ 
                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 505 466'%3E%3Cpath d='M391 0C413.091 0 431 17.9086 431 40V48C431 68.1152 447.052 84.4817 467.045 84.9883L468.955 85.0117C488.948 85.5183 505 101.885 505 122V426C505 448.091 487.091 466 465 466H40C17.9086 466 0 448.091 0 426V40C0 17.9086 17.9086 0 40 0H391Z' fill='black'/%3E%3C/svg%3E")`,
                    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 505 466'%3E%3Cpath d='M391 0C413.091 0 431 17.9086 431 40V48C431 68.1152 447.052 84.4817 467.045 84.9883L468.955 85.0117C488.948 85.5183 505 101.885 505 122V426C505 448.091 487.091 466 465 466H40C17.9086 466 0 448.091 0 426V40C0 17.9086 17.9086 0 40 0H391Z' fill='black'/%3E%3C/svg%3E")`,
                    WebkitMaskSize: "100% 100%", maskSize: "100% 100%"
                  }}
                >
                  <div 
                    className="w-full h-full pointer-events-none transform translate-y-[10px] scale-[0.85]
                               lg:translate-y-[2.4vw] lg:scale-[0.9] origin-bottom"
                  >
                    <OptimizedImage
                      image={(item.showImage || item.image) as any}
                      alt={item.name}
                      className="object-contain object-bottom w-full h-full"
                      size="large"
                    />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
