import React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
const safeImage = (img: any) => (typeof img === 'number' ? null : img)

export function GalleryTemplateFour({ section, items, locale }: any) {
  return (
    <section className="py-24 bg-[#E7E5D4] overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header with Top Border */}
        <div className="border-t border-[#627669]/30 pt-10 mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <h2 className="inline-flex items-center text-xs uppercase font-bold tracking-[0.3em] text-[#060C14]">
              <span className="w-2 h-2 rounded-full bg-primary mr-4"></span>
              {section.tagTitle || "Selected Articles"}
            </h2>
            
            <Link 
              className="inline-flex items-center gap-4 px-8 py-4 border border-[#060C14]/10 rounded-full uppercase text-[10px] font-black tracking-[0.2em] text-[#060C14] hover:bg-[#060C14] hover:text-white transition-all group shadow-sm bg-white/50 backdrop-blur"
              href={section.buttonLink || "/blog"}
            >
              {section.buttonText || "Discover More"}
              <svg className="w-3 h-3 group-hover:rotate-45 transition-transform" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 9L9 1M9 1H1.8M9 1V8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </Link>
          </div>
        </div>

        {/* Map over ALL items for large-scale display */}
        <div className="flex flex-col gap-20">
          {items.map((item: any, idx: number) => (
            <article 
              key={item.id || idx} 
              className={`flex flex-col lg:flex-row items-center bg-white/40 backdrop-blur-md rounded-[40px] overflow-hidden border border-white/60 shadow-2xl shadow-black/5 transition-all duration-500 hover:shadow-black/10 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Image Box - 50% */}
              <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto self-stretch">
                <div className="relative h-full group overflow-hidden">
                  <span className="absolute top-8 left-8 z-20 px-6 py-2 bg-[#060C14] text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    {item.categories?.[0]?.name || "Featured"}
                  </span>
                  <OptimizedImage 
                    image={safeImage(item.coverImage)} 
                    alt={item.title} 
                    size="xlarge"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                </div>
              </div>

              {/* Content Box - 50% */}
              <div className="w-full lg:w-1/2 p-10 sm:p-16 lg:p-24 text-center lg:text-start">
                <div className="flex flex-col">
                  <span className="flex items-center justify-center lg:justify-start gap-4 text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase mb-8">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                       <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                       <line x1="16" y1="2" x2="16" y2="6"></line>
                       <line x1="8" y1="2" x2="8" y2="6"></line>
                       <line x1="3" y1="10" x2="21" y2="10"></line>
                     </svg>
                     {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Jun 02, 2024"}
                  </span>

                  <Link href={`/${locale}/blog/${item.slug}`}>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-prata text-[#060C14] !leading-[1.2] mb-10 hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-12">
                     <div className="flex items-center gap-3">
                        {item.author?.avatar && (
                          <OptimizedImage 
                            image={safeImage(item.author.avatar)} 
                            alt={item.author.name} 
                            size="small"
                            className="w-8 h-8 rounded-full border border-white"
                          />
                        )}
                        <span className="text-[10px] font-black text-[#060C14] uppercase tracking-widest">{item.author?.name || "Admin"}</span>
                     </div>
                     <span className="text-gray-300">|</span>
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{(item.readTime || "05") + " MIN READ"}</span>
                  </div>

                  <Link 
                     className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#060C14] text-white hover:bg-primary transition-all duration-300 hover:rotate-45" 
                     href={`/${locale}/blog/${item.slug}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      
      {/* Wave Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 Style_waveBg__bNstF"></div>
    </section>
  )
}
