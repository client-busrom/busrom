import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import Link from "next/link"

interface BlogTemplateProps {
  blog: any
  locale: Locale
  formatDate: (date: string) => string
}

export function BlogTemplateThree({ blog, locale, formatDate }: BlogTemplateProps) {
  // Reference: https://reland-nextjs.vercel.app/blog-details
  // "Modern Corporate Detail" with sand background, 8:4 grid, and structured sidebar
  
  return (
    <article className="min-h-screen bg-[#F5F2ED] font-lexend-deca antialiased selection:bg-[#060C14] selection:text-white" data-header-theme="light">
      
      {/* 1. Page Title & Meta (Reland Style) */}
      <div className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-10">
              <span className="bg-[#060C14] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-sm">
                {blog.categories?.[0]?.name || 'Insights'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 text-sm font-medium">{formatDate(blog.publishedAt)}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-prata text-[#060C14] !leading-[1.2] mb-12">
              {blog.title}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Main Layout Grid */}
      <div className="container mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Content Card */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-white/50">
              {/* Feature Image */}
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={blog.coverImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200' } 
                  alt={blog.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Body Content */}
              <div className="p-8 md:p-16 lg:p-20">
                {blog.excerpt && (
                  <div className="mb-16 text-xl md:text-2xl text-[#060C14] font-medium leading-[1.6] opacity-90 border-b border-[#F5F2ED] pb-12">
                    {blog.excerpt}
                  </div>
                )}

                <div className="prose prose-xl max-w-none 
                  prose-headings:font-prata prose-headings:text-[#060C14]
                  prose-p:text-gray-600 prose-p:leading-[1.9]
                  prose-img:rounded-2xl prose-img:my-20
                  prose-blockquote:italic prose-blockquote:font-prata prose-blockquote:text-2xl prose-blockquote:text-[#060C14] prose-blockquote:border-l-4 prose-blockquote:border-[#060C14] prose-blockquote:bg-[#F5F2ED]/50 prose-blockquote:px-10 prose-blockquote:py-8 prose-blockquote:rounded-r-xl">
                  {blog.content ? <LexicalRenderer content={blog.content} /> : (
                    <div className="space-y-12">
                       <p>
                         Architecture is the art of reconciling human needs with structural possibilities. At Busrom, we view every project as a dialogue between these two forces. Our systems are engineered to facilitate this dialogue, providing the strength required for monumental structures with the lightness desired for modern aesthetics.
                       </p>
                       <h2 id="innovation">Driving Innovation through Precision</h2>
                       <p>
                         From our advanced CNC machining centers to our rigorous stress-testing protocols, precision is at the heart of everything we do. We believe that a high-performance façade is more than just a skin; it's a living system that must respond to environmental changes while maintaining its structural integrity.
                       </p>
                       <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop" className="w-full" alt="Architecture" />
                       <p>
                         As we look towards 2024 and beyond, the focus on sustainable, long-lasting materials like 316L stainless steel continues to grow. These materials not only offer superior corrosion resistance but also align with global green building standards.
                       </p>
                    </div>
                  )}
                </div>

                {/* Bottom Tags */}
                <div className="mt-20 pt-10 border-t border-[#F5F2ED] flex flex-wrap gap-4">
                  {['CurtainWalls', 'Innovation', 'Engineering'].map(tag => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-[#F5F2ED] px-4 py-2 rounded-full hover:bg-[#F5F2ED] transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-12">
             
             {/* Author Profile Card */}
             <div className="bg-white rounded-3xl p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.03)] border border-white/50 text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-8 overflow-hidden border-4 border-[#F5F2ED]">
                   <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" className="w-full h-full object-cover" alt="S. Thompson" />
                </div>
                <h3 className="text-xl font-prata text-[#060C14] mb-2">S. Thompson</h3>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff4848] mb-6">Structural Consultant</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-8 italic">
                  Leading our international project integration team since 2012. Expert in modular curtain wall connectivity.
                </p>
                <Link href="#" className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#060C14] hover:gap-4 transition-all">
                  Full Profile
                  <svg width="12" height="12" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.33008 17.4023L17.3301 1.40234M17.3301 1.40234H2.93008M17.3301 1.40234V15.8023" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
             </div>

             {/* Categories Widget */}
             <div className="bg-white rounded-3xl p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.03)] border border-white/50">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#060C14] mb-10 pb-4 border-b border-[#F5F2ED]">Knowledge Base</h4>
                <ul className="space-y-6">
                   {[
                     { name: 'Research & Labs', count: 12 },
                     { name: 'Project Logistics', count: 8 },
                     { name: 'Safety Standards', count: 15 },
                     { name: 'Sustainability', count: 6 }
                   ].map(cat => (
                     <li key={cat.name} className="flex items-center justify-between group cursor-pointer">
                        <span className="text-sm font-medium text-gray-600 group-hover:text-[#060C14] transition-colors">{cat.name}</span>
                        <span className="text-[10px] font-bold text-gray-300 group-hover:text-[#ff4848] transition-colors">{cat.count}</span>
                     </li>
                   ))}
                </ul>
             </div>

             {/* Corporate Newsletter CTA */}
             <div className="bg-[#060C14] rounded-3xl p-10 text-white relative overflow-hidden group">
                <div className="relative z-10">
                   <h4 className="text-2xl font-prata mb-6">Stay Informed</h4>
                   <p className="text-sm text-gray-400 mb-8 leading-relaxed">Join 5,000+ industry professionals receiving our weekly technical insights.</p>
                   <div className="space-y-4">
                      <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs focus:outline-none focus:border-white/30 transition-all" />
                      <button className="w-full py-4 bg-[#ff4848] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#ff5d5d] transition-all">Subscribe Now</button>
                   </div>
                </div>
                {/* Decorative cut-out mimic */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
             </div>

          </div>
        </div>
      </div>
    </article>
  )
}
