"use client";

import type { Locale } from "@/i18n.config"
import { BlogLexicalRenderer } from "@/components/blog/BlogLexicalRenderer"
import Link from "next/link"
import { useState, useEffect } from "react"
import { resolveModuleConfig } from "@/lib/blog-config-utils";

interface BlogTemplateProps {
  blog: any
  locale: Locale
  formatDate: (date: string) => string
  config: any
}

export function BlogTemplateTwo({ blog, locale, formatDate, config }: BlogTemplateProps) {
  // Reference: https://www.julesacree.com/all/2023-full-kitchen-tour
  // The "Jules Vibe": Warm neutrals (#F4F1ED), Charcoal text (#000000), Terracotta accents (#B06E4E).

  const [activeId, setActiveId] = useState<string>("")
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])

  const toc = resolveModuleConfig(blog, config, "toc", "toc", "template2");
  const share = resolveModuleConfig(blog, config, "share", "shareConfig", "template2");
  const search = resolveModuleConfig(blog, config, "search_box", "searchBox", "template2");
  const catList = resolveModuleConfig(blog, config, "category_list", "categoryList", "template2");
  const recommended = resolveModuleConfig(blog, config, "recommended_posts", "recommendedPosts", "template2");
  const follow = resolveModuleConfig(blog, config, "follow_us", "followUs", "template2");
  const footerCats = resolveModuleConfig(blog, config, "bottom_categories", "bottomCategories", "template2");
  const pagination = resolveModuleConfig(blog, config, "pagination", "pagination", "template2");
  const footerRec = resolveModuleConfig(blog, config, "bottom_recommended", "bottomRecommended", "template2");

  const showToc = toc.enabled;
  const showShare = share.enabled;
  const showSearch = search.enabled;
  const showCategoryList = catList.enabled;
  const showRecommended = recommended.enabled;
  const showFollowUs = follow.enabled;

  const showSidebar = showToc || showShare || showSearch || showCategoryList || showRecommended || showFollowUs

  const showFooterCategories = footerCats.enabled;
  const showPagination = pagination.enabled;
  const showFooterRecommended = footerRec.enabled;
  
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
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) setActiveId(visibleEntry.target.id);
      },
      { rootMargin: "-80px 0% -80% 0%" },
    )

    document.querySelectorAll("#blog-content h1, #blog-content h2, #blog-content h3").forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [blog, showToc])

  return (
    <article className="min-h-screen bg-[#F4F1ED] text-[#000000] pb-12 md:pb-20 font-montserrat selection:bg-[#DCAC96]/30 antialiased italic-none">
      {/* 1. Centered Header Section */}
      <header className="max-w-[1000px] mx-auto px-6 pt-[128px] pb-20 text-center">
        <div className="uppercase tracking-[4.5px] text-[10px] font-bold text-[#B06E4E] mb-4">
          {blog.categories?.[0]?.name || (locale === 'zh' ? '博斯罗姆精选' : 'Mindful Insights')}
        </div>
        
        <h1 className="text-[43.2px] font-montserrat font-bold leading-tight mb-[50px] text-[#000000] tracking-tight max-w-[900px] mx-auto">
          {blog.title}
        </h1>
        
        <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#000000]/50">
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
               className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
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
              <div className="mb-12">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#000000]/30 mb-4">{toc.title || "On This Page"}</h4>
                <nav className="space-y-4 border-l border-[#000000]/10 pl-6">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block text-[13px] transition-all transform hover:translate-x-1 ${
                        activeId === h.id ? "text-[#B06E4E] font-bold" : "text-[#000000]/60 hover:text-[#000000]"
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
                {showSearch && (
              <div className="pt-12 border-t border-[#000000]/10 mb-12">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#000000]/30 mb-6">Search</h4>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={search.placeholder || "Search..."}
                    spellCheck="false"
                    className="w-full bg-white border border-[#000000]/10 rounded-lg px-4 py-3 text-[12px] focus:outline-none focus:border-[#B06E4E]/30 transition-all"
                  />
                </div>
              </div>
            )}

            {showShare && (
              <div className="pt-12 border-t border-[#000000]/10 mb-12">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#000000]/30 mb-6">{share.title || "Share Story"}</h4>
                <div className="flex gap-4">
                  {share.networks?.map((net: any, i: number) => {
                    const shareUrl = net.url
                      ?.replace('{{URL}}', encodeURIComponent(typeof window !== 'undefined' ? window.location.href : ''))
                      ?.replace('{{TITLE}}', encodeURIComponent(blog.title || ''))
                    
                    return (
                      <a 
                        key={i} 
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full border border-[#000000]/10 flex items-center justify-center hover:bg-[#B06E4E] hover:text-white transition-all cursor-pointer"
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

            {showCategoryList && catList.categories?.length > 0 && (
              <div className="pt-12 border-t border-[#000000]/10 mb-12">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#000000]/30 mb-6">{catList.title || "Categories"}</h4>
                <ul className="space-y-3">
                  {catList.categories.map((cat: any) => (
                    <li key={cat.id}>
                      <Link
                        href={`/${locale}/blog?category=${cat.slug || cat.id}`}
                        className="text-[12px] font-bold text-[#000000]/60 hover:text-[#B06E4E] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showRecommended && recommended.posts?.length > 0 && (
              <div className="pt-12 border-t border-[#000000]/10 mb-12">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#000000]/30 mb-6">{recommended.title || "Recommended"}</h4>
                <div className="space-y-6">
                  {recommended.posts.slice(0, 3).map((rp: any) => (
                    <Link
                      key={rp.id}
                      href={`/${locale}/blog/${rp.slug}`}
                      className="group block space-y-2"
                    >
                      <h6 className="text-[13px] font-bold leading-tight text-[#000000] group-hover:text-[#B06E4E] transition-colors line-clamp-2 italic">
                        {rp.title}
                      </h6>
                      <p className="text-[10px] font-bold text-[#000000]/30 uppercase tracking-[2px]">{formatDate(rp.publishedAt)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {showFollowUs && follow.socials?.length > 0 && (
              <div className="pt-12 border-t border-[#000000]/10 mb-12">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#000000]/30 mb-6">{follow.title || "Follow Us"}</h4>
                <div className="flex flex-wrap gap-4">
                  {follow.socials.map((social: any, idx: number) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#000000]/60 hover:text-[#B06E4E] transition-colors"
                    >
                      <img 
                        src={`https://api.iconify.design/${social.icon?.replace(':', '/')}.svg?color=currentColor`} 
                        className="w-4 h-4" 
                        alt="" 
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
           </aside>
        )}

        {/* Narrative Column */}
        <main className={`${showSidebar ? 'lg:col-span-9' : 'max-w-[1000px] w-full mx-auto'} order-1 lg:order-2`}>
          <div id="blog-content" className="max-w-none">
            <BlogLexicalRenderer content={blog.content} mediaData={blog.mediaData} />
          </div>

          {/* 5. Minimalist Footer Pagination */}
          {showFooter && (
            <footer className="mt-16 md:mt-24 pt-12 md:pt-16 pb-8 flex flex-col items-center">
                <div className="w-full h-[1px] bg-[#000000]/10 mb-12 md:mb-16"></div>
                
                {/* Inline Text Categories (Jules Vibe) */}
                {showFooterCategories && footerCats.categories?.length > 0 && (
                   <div className="w-full flex flex-wrap justify-center items-center gap-3 mb-4 md:mb-12 text-[11px] uppercase font-bold tracking-[3px]">
                      {footerCats.categories.map((cat: any, idx: number) => (
                        <div key={cat.id || cat.name || idx} className="flex items-center gap-3">
                          <Link href={`/${locale}/blog?category=${cat.slug || cat.id}`} className="text-[#000000]/40 hover:text-[#B06E4E] transition-colors whitespace-nowrap">
                            {cat.name}
                          </Link>
                          {idx < footerCats.categories.length - 1 && (
                            <span className="text-[#B06E4E]/50">·</span>
                          )}
                        </div>
                      ))}
                   </div>
                )}

                {/* Pagination (Previous / Next Post) */}
                {showPagination && (
                  <div className="w-full flex justify-between items-center mb-12 md:mb-16 pb-12 md:pb-16 border-b border-[#000000]/10">
                    {(() => {
                      const prev = pagination.type === 'manual' ? pagination.prev_post : blog.prevPost;
                      const next = pagination.type === 'manual' ? pagination.next_post : blog.nextPost;
                      
                      return (
                        <>
                          {prev ? (
                            <Link href={`/${locale}/blog/${prev.slug}`} className="group flex flex-col items-start gap-4 flex-1 pr-4 md:pr-12">
                                <span className="text-[10px] font-black uppercase tracking-[4px] text-[#B06E4E]">« Previous</span>
                                <h4 className="text-lg md:text-2xl font-montserrat font-bold text-[#000000] group-hover:text-[#B06E4E] transition-colors leading-tight line-clamp-2">
                                  {prev.title}
                                </h4>
                            </Link>
                          ) : <div className="flex-1 pr-4 md:pr-12" />}
                          
                          <div className="w-[1px] h-16 md:h-24 bg-[#000000]/10 flex-shrink-0" />

                          {next ? (
                            <Link href={`/${locale}/blog/${next.slug}`} className="group flex flex-col items-end gap-4 flex-1 pl-4 md:pl-12 text-right">
                                <span className="text-[10px] font-black uppercase tracking-[4px] text-[#B06E4E]">Next »</span>
                                <h4 className="text-lg md:text-2xl font-montserrat text-[#000000] group-hover:text-[#B06E4E] transition-colors leading-tight line-clamp-2">
                                  {next.title}
                                </h4>
                            </Link>
                          ) : <div className="flex-1 pl-4 md:pl-12" />}
                        </>
                      );
                    })()}
                  </div>
                )}



                {/* Recommended Section / Explore More Link */}
                {showFooterRecommended && (
                  <div className="w-full flex flex-col items-center">
                    {/* Render the 3 Recommended Blogs if configured */}
                    {footerRec.posts?.length > 0 && (
                      <div className="w-full max-w-[1000px] mb-16 border-t border-[#000000]/10 pt-16 mt-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-[#000000]/30 mb-12 text-center">
                           {footerRec.title || (locale === 'zh' ? '推荐阅读' : 'Recommended Reading')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
                          {footerRec.posts.map((post: any) => (
                             <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group relative block aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                               <img src={post.coverImage?.url || (typeof post.coverImage === 'string' && post.coverImage.startsWith('http') ? post.coverImage : `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400`)} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" alt={post.title} />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                               <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                 <h5 className="text-white font-montserrat text-lg leading-tight line-clamp-2">{post.title}</h5>
                               </div>
                             </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Link 
                      href={`/${locale}/blog`} 
                      className="group flex flex-col items-center gap-5 text-[#B06E4E] no-underline"
                    >
                       <span className="uppercase tracking-[5px] text-[11px] font-bold group-hover:text-[#000000] transition-colors">
                         {locale === 'zh' ? '发现更多' : 'Explore more'}
                       </span>
                       <div className="w-16 h-[2px] bg-[#B06E4E] group-hover:w-32 transition-all duration-1000 ease-in-out group-hover:bg-[#000000]"></div>
                    </Link>
                  </div>
                )}
            </footer>
          )}
        </main>
      </div>
    </article>
  )
}
