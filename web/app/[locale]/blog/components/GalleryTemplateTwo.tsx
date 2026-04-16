import React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
const safeImage = (img: any) => (typeof img === 'number' ? null : img)

export function GalleryTemplateTwo({ section, items, locale }: any) {
  return (
    <section className="py-24 bg-[#060C14] text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* SIDEBAR - 5/12 width */}
          <div className="w-full lg:w-[41.6%]">
            <div className="sticky top-24 text-center lg:text-start">
              <p className="inline-flex items-center text-xs uppercase font-bold tracking-widest text-gray-400 mb-8">
                <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
                {section.tagTitle || "Popular Articles"}
              </p>
              <h2 className="text-4xl lg:text-5xl font-prata !leading-[1.2] mb-10 text-white">
                {section.introTitle}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed uppercase font-light tracking-wide mb-12">
                {section.introDescription}
              </p>
              
              <div className="hidden lg:block">
                <Link 
                  className="inline-flex items-center gap-4 px-10 py-5 border border-white/20 rounded-full uppercase text-[10px] font-black tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all group"
                  href={section.buttonLink || "/blog"}
                >
                  {section.buttonText || "All Posts"}
                  <svg className="w-3 h-3 group-hover:rotate-45 transition-transform" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L9 1M9 1H1.8M9 1V8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* CONTENT - 7/12 width with staggered items */}
          <div className="w-full lg:w-[58.3%]">
            <div className="flex flex-col gap-24">
              {items.map((item: any, idx: number) => {
                const isOdd = idx % 2 === 0
                return (
                  <div 
                    key={item.id || idx} 
                    className={`w-full lg:w-4/5 ${isOdd ? 'lg:mr-auto lg:pr-10' : 'lg:ml-auto lg:pl-10'}`}
                  >
                    <article className="post-card group relative flex flex-col items-center text-center">
                      <div className="relative w-full aspect-[16/10] mb-8 overflow-hidden rounded-2xl">
                         <span className="absolute top-4 right-4 z-20 px-4 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                            {item.categories?.[0]?.name || "article"}
                         </span>
                         <OptimizedImage 
                           image={safeImage(item.coverImage)} 
                           alt={item.title} 
                           size="large"
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                         />
                      </div>

                      <div className="max-w-xl">
                        <span className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">
                           {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Dec 15, 2023"}
                        </span>
                        
                        <Link href={`/${locale}/blog/${item.slug}`}>
                          <h3 className="text-2xl lg:text-3xl font-prata text-white leading-[1.4] mb-6 hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-center gap-4 mb-8 text-gray-400">
                           <span className="text-[10px] font-bold tracking-widest">{item.author?.name || "Nilima"}</span>
                           <span className="opacity-30">•</span>
                           <span className="text-[10px] font-bold tracking-widest">{(item.readTime || "02") + " MIN READ"}</span>
                        </div>

                        <Link className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300 group-hover:rotate-45" href={`/${locale}/blog/${item.slug}`}>
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </Link>
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
