import React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
const safeImage = (img: any) => (typeof img === 'number' ? null : img)

export function GalleryTemplateThree({ section, items, locale }: any) {
  const leftItems = items.slice(0, Math.ceil(items.length / 2))
  const rightItems = items.slice(Math.ceil(items.length / 2))

  return (
    <section className="py-24 bg-[#F9F9F4]">
      <div className="container mx-auto px-6">
        {/* Main 10/12 centered container */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* LEFT COLUMN */}
            <div className="w-full lg:w-1/2 flex flex-col gap-20">
              <div className="text-center lg:text-start mb-10">
                <p className="inline-flex items-center text-xs uppercase font-bold tracking-widest text-[#9C9C8C] mb-8">
                  <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
                  {section.tagTitle || "Trending Articles"}
                </p>
                <h2 className="text-4xl lg:text-5xl font-prata !leading-[1.2] mb-8 text-[#060C14]">
                  {section.introTitle}
                </h2>
                <p className="text-[#4E4C3D] text-sm sm:text-base leading-relaxed uppercase font-light tracking-wide mb-10">
                  {section.introDescription}
                </p>
                <div className="hidden lg:block">
                  <Link 
                    className="inline-flex items-center gap-4 px-10 py-5 border border-[#DBD8BD] rounded-full uppercase text-[10px] font-black tracking-[0.2em] text-[#060C14] hover:bg-[#060C14] hover:text-white transition-all group"
                    href={section.buttonLink || "/blog"}
                  >
                    {section.buttonText || "All Posts"}
                    <svg className="w-3 h-3 group-hover:rotate-45 transition-transform" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 9L9 1M9 1H1.8M9 1V8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </Link>
                </div>
              </div>

              {leftItems.map((item: any, idx: number) => (
                <div key={item.id || idx} className={`${idx === 0 ? 'w-4/5 mx-auto' : 'w-full ml-auto'}`}>
                  <PostCard item={item} locale={locale} />
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full lg:w-1/2 flex flex-col gap-20 lg:pt-32">
              {rightItems.map((item: any, idx: number) => (
                <div key={item.id || idx} className={`${idx === 1 ? 'w-4/5 ml-auto' : 'w-full'}`}>
                  <PostCard item={item} locale={locale} />
                </div>
              ))}
            </div>
            
            {/* Mobile Button */}
            <div className="w-full lg:hidden text-center mt-12 text-[#060C14]">
               <Link 
                  className="inline-flex items-center gap-4 px-10 py-5 border border-[#DBD8BD] rounded-full uppercase text-[10px] font-black tracking-[0.2em]"
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

function PostCard({ item, locale }: any) {
  return (
    <article className="post-card group relative flex flex-col text-center">
      <div className="relative aspect-[3/4] mb-8 overflow-hidden rounded-2xl">
         <span className="absolute top-4 right-4 z-20 px-4 py-1 bg-white/90 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest text-[#060C14] border border-black/5">
            {item.categories?.[0]?.name || "article"}
         </span>
         <OptimizedImage 
           image={safeImage(item.coverImage)} 
           alt={item.title} 
           size="large"
           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
         />
      </div>

      <div className="px-4">
        <span className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] text-[#9C9C8C] uppercase mb-4">
           {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Mar 22, 2024"}
        </span>
        
        <Link href={`/${locale}/blog/${item.slug}`}>
          <h3 className="text-xl lg:text-2xl font-prata text-[#060C14] leading-[1.4] mb-6 hover:text-primary transition-colors">
            {item.title}
          </h3>
        </Link>

        <div className="flex items-center justify-center gap-4 mb-8 text-gray-500">
           <span className="text-[10px] font-bold tracking-widest">{item.author?.name || "Kathryn"}</span>
           <span className="opacity-30">•</span>
           <span className="text-[10px] font-bold tracking-widest">{(item.readTime || "03") + " MIN READ"}</span>
        </div>

        <Link className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[#DBD8BD] group-hover:bg-[#060C14] group-hover:text-white transition-all duration-300 group-hover:rotate-45 shadow-sm" href={`/${locale}/blog/${item.slug}`}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </Link>
      </div>
    </article>
  )
}
