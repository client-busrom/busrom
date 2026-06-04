import React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
const safeImage = (img: any) => (typeof img === 'number' ? null : img)

export function BlogCard({ item, locale }: { item: any, locale: string }) {
  return (
    <article className="post-card group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* Image Container with Corner Logic */}
      <div className="relative aspect-[4/3] overflow-hidden group">
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

      <div className="text-center px-4 py-6 flex-1 flex flex-col">
        <span className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] text-[#9C9C8C] uppercase mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "May 12, 2024"}
        </span>

        <Link href={`/${locale}/blog/${item.slug}`} className="flex-1">
          <h3 className="text-xl lg:text-2xl font-prata text-[#060C14] leading-[1.4] mb-4 hover:text-[#ff4848] transition-colors line-clamp-2">
            {item.title}
          </h3>
        </Link>

        <div className="flex items-center justify-center gap-3 mb-6 mt-auto">
           {item.author?.avatar && (
             <OptimizedImage 
               image={safeImage(item.author.avatar)} 
               alt={item.author.name} 
               size="small"
               className="w-6 h-6 rounded-full border border-gray-100 object-cover"
             />
           )}
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.author?.name || "Busrom"}</span>
           <span className="text-gray-300">•</span>
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{(item.readTime || "03") + " MIN READ"}</span>
        </div>

        <Link className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F5F4E9] group-hover:bg-[#060C14] group-hover:text-white transition-all duration-300 group-hover:rotate-45" href={`/${locale}/blog/${item.slug}`}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </Link>
      </div>
    </article>
  )
}
