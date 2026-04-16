import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import Link from "next/link"
import { useState, useEffect } from "react"

interface BlogTemplateProps {
  blog: any
  locale: Locale
  formatDate: (date: string) => string
  config: any
}

export function BlogTemplateTwo({ blog, locale, formatDate, config }: BlogTemplateProps) {
  // Reference: https://www.julesacree.com/all/2023-full-kitchen-tour
  // The "Jules Vibe": Warm neutrals (#F4F1ED), Charcoal text (#474642), Terracotta accents (#B06E4E).

  const [activeId, setActiveId] = useState<string>("")
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])

  // Configuration toggles
  // Configuration toggles (Decentralized)
  const showToc = config?.toc?.enabled && config?.toc?.templates?.includes('template2')
  const showShare = config?.shareConfig?.enabled && config?.shareConfig?.templates?.includes('template2')
  const showSearch = config?.searchBox?.enabled && config?.searchBox?.templates?.includes('template2')
  const showCategoryList = config?.categoryList?.enabled && config?.categoryList?.templates?.includes('template2')
  const showRecommended = config?.recommendedPosts?.enabled && config?.recommendedPosts?.templates?.includes('template2')
  const showFollowUs = config?.followUs?.enabled && config?.followUs?.templates?.includes('template2')

  const showSidebar = showToc || showShare || showSearch || showCategoryList || showRecommended || showFollowUs

  const showFooterCategories = config?.bottomCategories?.enabled && config?.bottomCategories?.templates?.includes('template2')
  const showPagination = config?.pagination?.enabled && config?.pagination?.templates?.includes('template2')
  const showFooterRecommended = config?.bottomRecommended?.enabled && config?.bottomRecommended?.templates?.includes('template2')
  
  const showFooter = showFooterCategories || showPagination || showFooterRecommended

  useEffect(() => {
    if (!showToc) return
    const contentElement = document.getElementById("blog-content")
    if (contentElement) {
      const hElements = contentElement.querySelectorAll("h1, h2, h3")
      const extracted = Array.from(hElements).map((el, idx) => {
        const id = el.id || `heading-${idx}`
        el.id = id
        return {
          id,
          text: el.textContent || "",
          level: parseInt(el.tagName.replace("H", ""))
        }
      })
      setHeadings(extracted)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: "-20% 0% -35% 0%" }
    )

    document.querySelectorAll("#blog-content h1, #blog-content h2, #blog-content h3").forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [blog, showToc])

  return (
    <article className="min-h-screen bg-[#F4F1ED] text-[#474642] pb-32 font-lexend-deca selection:bg-[#DCAC96]/30 antialiased italic-none">
      {/* 1. Centered Header Section */}
      <header className="max-w-[1000px] mx-auto px-6 pt-[128px] pb-20 text-center">
        <div className="uppercase tracking-[4.5px] text-[10px] font-extrabold text-[#B06E4E] mb-8">
          {blog.categories?.[0]?.name || (locale === 'zh' ? '博斯罗姆精选' : 'Mindful Insights')}
        </div>
        
        <h1 className="text-[40px] md:text-[52px] font-prata leading-[1.2] mb-[50px] text-[#474642] tracking-tight max-w-[900px] mx-auto">
          {blog.title}
        </h1>
        
        <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#474642]/50">
          BY {blog.author?.name?.toUpperCase() || blog.author?.toUpperCase() || 'BUSROM EDITORIAL'} &nbsp; | &nbsp; {formatDate(blog.publishedAt)}
        </div>
      </header>

      {/* 2. Featured Image Container */}
      {blog.coverImage && (
        <div className="max-w-[1100px] mx-auto px-6 mb-[80px]">
          <div className="aspect-[16/9] relative overflow-hidden rounded-xl shadow-sm">
             <img 
               src={blog.coverImage?.url || blog.coverImage} 
               alt={blog.title} 
               className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105" 
             />
          </div>
        </div>
      )}

      {/* 3. Main Content Area with Optional Sidebar */}
      <div className={`max-w-[1240px] mx-auto px-6 ${showSidebar ? 'grid grid-cols-1 lg:grid-cols-12 gap-16' : 'flex justify-center'}`}>
        
        {/* SIDEBAR (Optional) */}
        {showSidebar && (
           <aside className="lg:col-span-3 space-y-12 order-2 lg:order-1">
             {showToc && headings.length > 0 && (
               <div className="sticky top-32">
                 <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#474642]/30 mb-8">On This Page</h4>
                 <nav className="space-y-4 border-l border-[#474642]/10 pl-6">
                   {headings.map((h) => (
                     <a
                       key={h.id}
                       href={`#${h.id}`}
                       className={`block text-[13px] transition-all transform hover:translate-x-1 ${
                         activeId === h.id ? "text-[#B06E4E] font-bold" : "text-[#474642]/60 hover:text-[#474642]"
                       }`}
                       style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                       onClick={(e) => {
                         e.preventDefault()
                         document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
                       }}
                     >
                       {h.text}
                     </a>
                   ))}
                 </nav>
               </div>
             )}

             {showShare && (
               <div className="pt-12 border-t border-[#474642]/10">
                 <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#474642]/30 mb-6">Share Story</h4>
                 <div className="flex gap-4">
                    {config.shareConfig?.networks?.map((net: any, i: number) => {
                      const shareUrl = net.url
                        ?.replace('{{URL}}', encodeURIComponent(typeof window !== 'undefined' ? window.location.href : ''))
                        ?.replace('{{TITLE}}', encodeURIComponent(blog.title || ''))
                      
                      return (
                        <a 
                          key={i} 
                          href={shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full border border-[#474642]/10 flex items-center justify-center hover:bg-[#B06E4E] hover:text-white transition-all cursor-pointer"
                        >
                           <img 
                             src={`https://api.iconify.design/${net.icon?.replace(':', '/')}.svg?color=currentColor`} 
                             className="w-3.5 h-3.5" 
                             alt="" 
                           />
                        </a>
                      )
                    })}
                 </div>
               </div>
             )}
           </aside>
        )}

        {/* Narrative Column */}
        <main className={`${showSidebar ? 'lg:col-span-9' : 'max-w-[800px] w-full'} order-1 lg:order-2`}>
          <div id="blog-content" className="prose prose-stone prose-lg max-w-none text-[#474642]/90 leading-[1.8] font-lexend-deca italic-none">
            <LexicalRenderer content={blog.content} />
          </div>

          {/* Social / Categories below content */}
          <div className="mt-32 pt-12 border-t border-[#474642]/15 flex flex-wrap gap-6 items-center">
              <span className="text-[10px] uppercase font-extrabold tracking-[2px] text-[#474642]/40">TAGS:</span>
              {blog.tags?.map((tag: any) => (
                <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`} className="text-[13px] font-bold text-[#B06E4E] hover:text-[#474642] cursor-pointer uppercase tracking-widest transition-colors">
                  {tag.name}
                </Link>
              ))}
          </div>

          {/* 5. Minimalist Footer Pagination */}
          {showFooter && (
            <footer className="mt-32 py-20 border-t border-[#474642]/10 flex flex-col items-center">
                {showFooterCategories && config?.bottomCategories?.categories?.length > 0 && (
                   <div className="flex gap-12 mb-20 overflow-x-auto w-full justify-center px-4 text-center">
                      {config.bottomCategories.categories.map((cat: any) => (
                        <Link key={cat.id || cat.name} href={`/${locale}/blog?category=${cat.slug || cat.id}`} className="group relative shrink-0">
                           <div className="w-40 h-24 mb-4 rounded-lg overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                             <img src={cat.coverImage?.url || cat.coverImage || `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400`} className="w-full h-full object-cover" alt="" />
                           </div>
                           <span className="text-[11px] font-black uppercase tracking-[3px] text-[#474642]/40 group-hover:text-[#B06E4E]">{cat.name}</span>
                        </Link>
                      ))}
                   </div>
                )}
                
                <Link 
                  href={`/${locale}/blog`} 
                  className="group flex flex-col items-center gap-6 text-[#B06E4E] no-underline"
                >
                   <span className="uppercase tracking-[5px] text-[11px] font-extrabold group-hover:text-[#474642] transition-colors">
                     {locale === 'zh' ? '发现更多' : 'Explore more'}
                   </span>
                   <div className="w-16 h-[2px] bg-[#B06E4E] group-hover:w-32 transition-all duration-1000 ease-in-out group-hover:bg-[#474642]"></div>
                </Link>
            </footer>
          )}
        </main>
      </div>
    </article>
  )
}
