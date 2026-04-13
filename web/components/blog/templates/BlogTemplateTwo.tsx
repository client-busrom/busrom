import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import Link from "next/link"

interface BlogTemplateProps {
  blog: any
  locale: Locale
  formatDate: (date: string) => string
}

export function BlogTemplateTwo({ blog, locale, formatDate }: BlogTemplateProps) {
  // Reference: https://www.julesacree.com/all/2023-full-kitchen-tour
  // "Minimal Lifestyle" with warm palette, centered serif, and airy spacing
  
  return (
    <article className="min-h-screen bg-[#FDFCFB] selection:bg-[#D4A38B]/30 antialiased" data-header-theme="light">
      
      {/* 1. Centered Header */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#D4A38B] mb-12">
          {blog.categories?.[0]?.name || 'Lifestyle'} • {formatDate(blog.publishedAt)}
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-prata text-[#1A1A1A] !leading-[1.2] mb-12 italic font-light tracking-tight">
          {blog.title}
        </h1>
        
        <div className="w-12 h-[1px] bg-[#1A1A1A] mx-auto mb-12 opacity-20"></div>
        
        <div className="text-[13px] font-bold uppercase tracking-[0.2em] text-gray-400 italic">
          Story by {blog.author || 'Busrom Design Team'}
        </div>
      </div>

      {/* 2. Hero Image - Tall / Portrait feel */}
      <div className="max-w-6xl mx-auto px-6 mb-32">
        <div className="aspect-[4/5] md:aspect-video relative overflow-hidden rounded-sm shadow-sm">
          <img 
            src={blog.coverImage || 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=1200&h=800&fit=crop'} 
            alt={blog.title} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[3000ms] ease-out scale-105 hover:scale-100" 
          />
        </div>
      </div>

      {/* 3. Narrative Content */}
      <div className="max-w-2xl mx-auto px-6">
        {blog.excerpt && (
          <div className="mb-24 text-2xl text-[#1A1A1A] font-prata leading-relaxed text-center italic opacity-90">
            "{blog.excerpt}"
          </div>
        )}
        
        <div className="prose prose-neutral max-w-none 
          prose-headings:font-prata prose-headings:font-normal prose-headings:text-center prose-headings:mt-24 prose-headings:mb-12 prose-headings:italic prose-headings:text-[#1A1A1A]
          prose-p:text-gray-600 prose-p:leading-[2.2] prose-p:text-lg prose-p:mb-10
          prose-blockquote:border-l-0 prose-blockquote:my-28 prose-blockquote:p-0 prose-blockquote:text-center
          prose-img:rounded-md prose-img:my-20">
          
          {blog.content ? <LexicalRenderer content={blog.content} /> : (
            <div className="space-y-12">
               <p>
                 There's something deeply intentional about the materials we choose to live with. In our recent studio refresh, we focused on tactile quality—the weight of a handle, the smoothness of a hinge, the way light catches a piece of brushed stainless steel.
               </p>
               <img src="https://images.unsplash.com/photo-1503387762-5929c6946da8?w=800&h=1000&fit=crop" className="w-full shadow-lg" alt="Lifestyle" />
               <p>
                 It's not just about functionality; it's about the feeling of home. A place where every detail is considered and every material tells a story of craftsmanship and permanence.
               </p>
               <blockquote className="text-3xl font-prata italic text-[#D4A38B]">
                 "Quality is not an act, it is a habit."
               </blockquote>
               <p>
                 We hope this tour inspires you to look closer at the details in your own space. Sometimes the smallest additions are the ones that bring the most joy.
               </p>
            </div>
          )}
        </div>

        {/* 4. Social & Sharing */}
        <div className="mt-40 pt-16 border-t border-[#F0EBE6] flex flex-col items-center">
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4A38B] mb-8">Spread the light</span>
           <div className="flex gap-12 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              <button className="hover:text-[#D4A38B] transition-colors border-b border-transparent hover:border-[#D4A38B] pb-1">Pinterest</button>
              <button className="hover:text-[#D4A38B] transition-colors border-b border-transparent hover:border-[#D4A38B] pb-1">Twitter</button>
              <button className="hover:text-[#D4A38B] transition-colors border-b border-transparent hover:border-[#D4A38B] pb-1">Copy Link</button>
           </div>
        </div>

        {/* 5. Minimal Footer Navigation */}
        <div className="mt-48 text-center pb-32">
           <div className="w-px h-24 bg-[#D4A38B] mx-auto mb-12 opacity-40"></div>
           <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em] block mb-8">Read Next Story</span>
           <Link href={`/${locale}/blog`} className="text-3xl md:text-5xl font-prata italic text-[#1A1A1A] hover:text-[#D4A38B] transition-colors decoration-[#D4A38B]/20 underline underline-offset-8">
             {locale === 'zh' ? '探索简约五金的深度 →' : 'The Depth of Minimal Hardware →'}
           </Link>
        </div>
      </div>
    </article>
  )
}
