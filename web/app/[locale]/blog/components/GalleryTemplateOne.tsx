import React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
const safeImage = (img: any) => (typeof img === 'number' ? null : img)

export function GalleryTemplateOne({ section, items, locale }: any) {
  return (
    <section className="pb-16 sm:pb-24">
      <div className="container mx-auto px-6">
        <div className="w-full">
          <hr className="border-[#DBD8BD]" />
        </div>
        
        {/* Force Two-Column Layout with Flex */}
        <div className="flex flex-col lg:flex-row mt-16 sm:mt-24 gap-12">
          
          {/* LEFT SIDEBAR - 1/3 Width (col-4) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 text-center lg:text-start">
              <p className="inline-flex items-center text-xs uppercase font-bold tracking-widest text-[#9C9C8C] mb-8">
                <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
                {section.tagTitle || "Latest Articles"}
              </p>
              
              <h2 className="text-4xl lg:text-5xl font-prata !leading-[1.2] mb-10 text-[#060C14]">
                {section.introTitle}
              </h2>
              
              <p className="text-[#4E4C3D] text-sm sm:text-base leading-relaxed uppercase font-light tracking-wide mb-12">
                {section.introDescription}
              </p>
              
              <div className="hidden lg:block">
                <Link 
                  className="inline-flex items-center gap-4 px-10 py-5 border border-[#DBD8BD] rounded-full uppercase text-[10px] font-black tracking-[0.2em] text-[#060C14] hover:bg-[#060C14] hover:text-white hover:border-[#060C14] transition-all group"
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

          {/* RIGHT GRID - 2/3 Width (col-8) */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {items.map((item: any, idx: number) => (
                <article key={item.id || idx} className="post-card group relative flex flex-col h-full">
                  {/* Image Container with Corner Logic */}
                  <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-2xl group">
                    <span className="absolute top-4 right-4 z-20 px-4 py-1 bg-white rounded-full text-[9px] font-black uppercase tracking-widest text-[#060C14] border border-black/5">
                      {item.categories?.[0]?.name || "category"}
                    </span>
                    
                    <OptimizedImage 
                      image={safeImage(item.coverImage)} 
                      alt={item.title} 
                      size="large"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  </div>

                  <div className="text-center px-4">
                    <span className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] text-[#9C9C8C] uppercase mb-4">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "May 12, 2024"}
                    </span>

                    <Link href={`/${locale}/blog/${item.slug}`}>
                      <h3 className="text-xl lg:text-2xl font-prata text-[#060C14] leading-[1.4] mb-4 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-center gap-3 mb-8">
                       {item.author?.avatar && (
                         <OptimizedImage 
                           image={safeImage(item.author.avatar)} 
                           alt={item.author.name} 
                           size="small"
                           className="w-6 h-6 rounded-full border border-gray-100"
                         />
                       )}
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.author?.name || "Nilima"}</span>
                       <span className="text-gray-300">•</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{(item.readTime || "03") + " MIN READ"}</span>
                    </div>

                    <Link className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F5F4E9] group-hover:bg-[#060C14] group-hover:text-white transition-all duration-300 group-hover:rotate-45" href={`/${locale}/blog/${item.slug}`}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile Button Fallback */}
            <div className="mt-16 text-center lg:hidden">
              <Link 
                className="inline-flex items-center gap-4 px-10 py-5 border border-[#DBD8BD] rounded-full uppercase text-[10px] font-black tracking-[0.2em] text-[#060C14]"
                href={section.buttonLink || "/blog"}
              >
                {section.buttonText || "All Posts"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
