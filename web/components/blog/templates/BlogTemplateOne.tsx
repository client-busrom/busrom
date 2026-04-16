"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Locale } from "@/i18n.config";
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";
import Link from "next/link";
import {
  EyoloCornerRound,
  EyoloScrollBadge,
} from "@/components/blog/ReplicaAssets";

interface BlogTemplateProps {
  blog: any;
  locale: Locale;
  formatDate: (date: string) => string;
}

export function BlogTemplateOne({
  locale,
  formatDate,
  config
}: { blog: any, locale: Locale, formatDate: (date: string) => string, config: any }) {
  const [activeSection, setActiveSection] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const [sidebarLimit, setSidebarLimit] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);
  
  useEffect(() => {
    if (containerRef.current && sidebarRef.current) {
      setOffsetTop(containerRef.current.offsetTop);
      setSidebarLimit(containerRef.current.offsetHeight - sidebarRef.current.offsetHeight);
    }
  }, [blog]);

  const sidebarY = useTransform(
    scrollY, 
    [offsetTop - 96, offsetTop - 96 + sidebarLimit], 
    [0, sidebarLimit],
    { clamp: true }
  );

  const showToc = config?.toc?.enabled && config?.toc?.templates?.includes('template1')
  const showShare = config?.shareConfig?.enabled && config?.shareConfig?.templates?.includes('template1')
  const showSearch = config?.searchBox?.enabled && config?.searchBox?.templates?.includes('template1')
  const showCategoryList = config?.categoryList?.enabled && config?.categoryList?.templates?.includes('template1')
  const showRecommended = config?.recommendedPosts?.enabled && config?.recommendedPosts?.templates?.includes('template1')
  const showFollowUs = config?.followUs?.enabled && config?.followUs?.templates?.includes('template1')

  const isSidebarEnabled = showToc || showShare || showSearch || showCategoryList || showRecommended || showFollowUs

  const showFooterCategories = config?.bottomCategories?.enabled && config?.bottomCategories?.templates?.includes('template1')
  const showPagination = config?.pagination?.enabled && config?.pagination?.templates?.includes('template1')
  const showFooterRecommended = config?.bottomRecommended?.enabled && config?.bottomRecommended?.templates?.includes('template1')
  
  const isFooterEnabled = showFooterCategories || showPagination || showFooterRecommended

  // Simple TOC generation from content headings
  const tocItems = showToc ? (blog.toc || [
    { id: "intro", title: locale === "zh" ? "简介" : "Introduction" }
  ]) : [];

  useEffect(() => {
    if (!showToc) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    tocItems.forEach((item: any) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [blog, tocItems, config?.showToc]);

  const isSidebarEnabled = config?.sidebarTemplates?.includes('template1');
  const isFooterEnabled = config?.footerTemplates?.includes('template1');

  return (
    <article
      className="min-h-screen bg-white font-lexend-deca antialiased selection:bg-[#ff4848] selection:text-white"
      data-header-theme="light"
    >
      {/* 1. Post Header Info */}
      <div id="post-header" className="py-16 sm:py-20 overflow-clip">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:flex-nowrap items-center">
            <div className="lg:w-6/12 text-center lg:text-left">
              <div className="mb-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-x-4 gap-y-1">
                <Link
                  href={`/${locale}/blog`}
                  className="uppercase bg-white/10 border border-[#DCDBD0] rounded-md px-4 py-2 text-[10px] font-bold tracking-widest block text-[#ff4848] hover:text-white hover:bg-[#ff4848] transition-all duration-300 w-fit lg:mx-0"
                >
                  {blog.categories?.[0]?.name || "self-care"}
                </Link>
                <span className="font-extralight opacity-40">—</span>
                <p className="text-gray-500 text-xs font-medium">
                  {formatDate(blog.publishedAt)}
                </p>
              </div>

              <h1 className="text-[29px] font-prata !leading-[1.4] mb-10 text-[#060C14]">
                {blog.title}
              </h1>

              <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-3 gap-y-1 uppercase text-[10px] font-bold tracking-[0.2em] text-[#060C14] mb-12">
                <li className="flex items-center gap-2">
                  <span className="text-gray-400 font-medium lowercase italic opacity-80">
                    Author of the post -
                  </span>
                  <Link
                    href="#"
                    className="hover:text-[#ff4848] transition-all duration-300 underline underline-offset-4"
                  >
                    {blog.author?.name || "Kathryn Jackson"}
                  </Link>
                </li>
                <li className="text-gray-300 opacity-40">•</li>
                <li>03 MIN TO READ</li>
              </ul>

              <div className="flex items-center justify-center lg:justify-start gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                <span>— scroll down</span>
                <span className="opacity-40">—</span>
                <span>read more</span>
              </div>
            </div>

            <div className="lg:w-8/12 w-full mt-12 lg:mt-0 lg:pl-12">
              <div className="relative w-full aspect-[16/11]">
                <img
                  className="rounded-3xl object-cover bg-dark/10 w-full h-full shadow-2xl"
                  src={
                    blog.coverImage ||
                    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
                  }
                  alt={blog.title}
                />
                <EyoloCornerRound className="absolute bottom-0 left-0 z-20 rotate-90 w-6 h-6 text-white" />
                <EyoloCornerRound className="absolute top-0 right-0 z-20 -rotate-90 w-6 h-6 text-white" />
                <div className="absolute -bottom-10 left-3 lg:-left-12">
                  <EyoloScrollBadge />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 hidden lg:block">
        <hr className="border-[#F0EBE6]" />
      </div>

      {/* 3. Main Content Grid */}
      <div className="lg:pt-20 pb-24">
        <div className="container mx-auto px-6">
          <div ref={containerRef} className="flex flex-col lg:flex-row gap-16 relative">
            {/* Main Content Column */}
            <div className={isSidebarEnabled ? "lg:w-8/12 xl:w-9/12" : "w-full max-w-4xl mx-auto"}>
              <div id="post-content" className="prose prose-lg max-w-none 
                prose-headings:font-prata prose-headings:text-[#060C14] prose-headings:!leading-tight
                prose-h2:text-[24px] prose-h2:mt-16 prose-h2:mb-8
                prose-p:text-[16px] prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:mb-8
                prose-li:text-[16px] prose-li:text-gray-600 prose-li:mb-2
                prose-blockquote:border-0 prose-blockquote:p-0 prose-blockquote:my-16 
                prose-blockquote:text-[24px] prose-blockquote:italic prose-blockquote:text-[#060C14] prose-blockquote:text-center prose-blockquote:mx-auto prose-blockquote:max-w-3xl">
                
                {blog.content ? (
                  <LexicalRenderer content={blog.content} />
                ) : (
                  <p className="italic text-gray-400">Content loading or empty...</p>
                )}
              </div>

              {/* Dynamic Footer Features */}
              {isFooterEnabled && (
                <div className="mt-24 space-y-24">
                  {/* Category Dots */}
                  {showFooterCategories && config.bottomCategories?.categories?.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                      {config.bottomCategories.categories.map((cat: any, i: number) => (
                        <span key={cat.id} className="flex items-center gap-4">
                           <Link href={`/${locale}/blog?category=${cat.slug || cat.id}`} className="hover:text-[#ff4848] transition-colors">{cat.name}</Link>
                           {i < config.bottomCategories.categories.length - 1 && <span className="opacity-20">•</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {showFooterRecommended && config.bottomRecommended?.posts?.length > 0 && (
                    <div className="border-t border-[#F0EBE6] pt-16">
                      <div className="text-center mb-12">
                        <h4 className="text-[24px] font-prata text-[#060C14]">{config.bottomRecommended.title || 'Recommended Stories'}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {config.bottomRecommended.posts.map((p: any) => (
                           <div key={p.id} className="group">
                              <Link href={`/${locale}/blog/${p.slug}`} className="block relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                                 <img src={p.coverImage?.url || p.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title} />
                              </Link>
                              <h5 className="text-lg font-prata hover:text-[#ff4848] transition-colors line-clamp-2">{p.title}</h5>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Author Bio Section (Always show or optional?) */}
              <div className="mt-24 p-8 sm:p-12 bg-[#F5F2ED] rounded-[40px] flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left group">
                <div className="w-40 h-40 rounded-[30px] overflow-hidden flex-shrink-0 shadow-xl">
                  <img
                    src={blog.author?.avatar?.url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=300&fit=crop"}
                    alt={blog.author?.name || "Kathryn Jackson"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div>
                  <h4 className="text-[24px] font-prata mb-2 text-[#060C14]">
                    {blog.author?.name || "Kathryn Jackson"}
                  </h4>
                  <p className="text-[#ff4848] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                    {blog.author?.title || "Editorial Team"}
                  </p>
                  <p className="text-gray-500 text-[16px] leading-relaxed mb-10 max-w-xl italic">
                    {blog.author?.bio || 'Passionate about structural beauty and engineering innovation.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            {isSidebarEnabled && (
              <div className="lg:w-4/12 xl:w-3/12 hidden lg:block relative">
                <motion.div ref={sidebarRef} style={{ y: sidebarY }} className="space-y-16">
                  {showToc && tocItems.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#060C14] mb-10 pb-4 border-b border-[#F0EBE6] flex items-center gap-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4848]" />
                        In this story
                      </h4>
                      <nav>
                        <ul className="space-y-8">
                          {tocItems.map((item: any) => (
                            <li key={item.id} className="group flex items-center gap-4">
                              <span className={`h-[2px] bg-[#ff4848] transition-all duration-300 ${activeSection === item.id ? "w-5" : "w-0"}`} />
                              <Link href={`#${item.id}`} className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeSection === item.id ? "text-[#ff4848] translate-x-1" : "text-gray-400 hover:text-[#ff4848]"}`}>
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  )}

                  {/* Other Sidebar Widgets (Socials, Recommended, etc.) */}
                  {showShare && (
                    <div className="pt-8 border-t border-[#F0EBE6]">
                       <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-gray-400">{config.shareConfig.title || 'Share Post'}</h5>
                       <div className="flex gap-4">
                          {config.shareConfig.networks?.map((net: any, i: number) => {
                             const shareUrl = net.url
                               ?.replace('{{URL}}', encodeURIComponent(typeof window !== 'undefined' ? window.location.href : ''))
                               ?.replace('{{TITLE}}', encodeURIComponent(blog.title || ''))
                             
                             return (
                               <a 
                                 key={i} 
                                 href={shareUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#ff4848] hover:text-white transition-all cursor-pointer"
                               >
                                  <img 
                                    src={`https://api.iconify.design/${net.icon?.replace(':', '/')}.svg?color=currentColor`} 
                                    className="w-4 h-4" 
                                    alt="" 
                                  />
                               </a>
                             )
                          })}
                       </div>
                    </div>
                  )}
                  
                  {showRecommended && config.recommendedPosts.posts?.length > 0 && (
                    <div className="pt-8 border-t border-[#F0EBE6]">
                       <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-gray-400">{config.recommendedPosts.title || 'Recommended'}</h5>
                       <div className="space-y-6">
                          {config.recommendedPosts.posts.slice(0, 3).map((rp: any) => (
                             <Link key={rp.id} href={`/${locale}/blog/${rp.slug}`} className="group block">
                                <h6 className="text-[13px] font-bold uppercase leading-relaxed text-[#060C14] group-hover:text-[#ff4848] transition-colors line-clamp-2">{rp.title}</h6>
                             </Link>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="p-10 bg-[#060C14] text-white rounded-[40px] relative overflow-hidden group">
                    <div className="relative z-10">
                      <h5 className="text-[24px] font-prata mb-6">Join our newsletter</h5>
                      <p className="text-[16px] text-gray-400 mb-8 leading-relaxed font-light italic">Stay updated with the latest insights from global leaders.</p>
                      <div className="relative">
                        <input type="email" placeholder="Email Address" className="w-full bg-[#1A1A1A] border-0 rounded-full py-4 px-6 text-[10px] font-bold tracking-widest text-white focus:ring-1 focus:ring-[#ff4848] transition-all" />
                        <button className="absolute right-2 top-1.5 bottom-1.5 w-10 h-10 rounded-full bg-[#ff4848] flex items-center justify-center hover:bg-white hover:text-[#ff4848] transition-colors">
                           <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </div>
                    <EyoloCornerRound className="absolute -bottom-10 -right-10 w-32 h-32 text-white/5 rotate-180" />
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

    </article>
  );
}
