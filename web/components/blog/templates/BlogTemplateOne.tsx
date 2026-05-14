"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Locale } from "@/i18n.config";
import { BlogLexicalRenderer } from "@/components/blog/BlogLexicalRenderer";
import Link from "next/link";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import {
  EyoloCornerRound,
  EyoloScrollBadge,
} from "@/components/blog/ReplicaAssets";

import { resolveModuleConfig } from "@/lib/blog-config-utils";

const getReadTime = (content: any): number => {
  if (!content?.root) return 3; // Default 3 min if empty
  
  let totalText = "";
  const traverse = (node: any) => {
    if (node.type === "text" && node.text) {
      totalText += node.text + " ";
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  };
  traverse(content.root);
  
  // Count words: English words separated by space, plus CJK characters.
  const wordCount = totalText.split(/\s+/).filter(Boolean).length;
  const cjkChars = (totalText.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  const totalWords = wordCount + cjkChars;
  const readTime = Math.ceil(totalWords / 250); // Given ~250 WPM reading speed
  return Math.max(1, readTime); // At least 1 min
};

export function BlogTemplateOne({
  blog,
  locale,
  formatDate,
  config,
}: {
  blog: any;
  locale: Locale;
  formatDate: (date: string) => string;
  config: any;
}) {
  const [activeSection, setActiveSection] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const [sidebarLimit, setSidebarLimit] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    if (containerRef.current && sidebarRef.current) {
      setOffsetTop(containerRef.current.offsetTop);
      setSidebarLimit(
        containerRef.current.offsetHeight - sidebarRef.current.offsetHeight,
      );
    }
  }, [blog]);

  const sidebarY = useTransform(
    scrollY,
    [offsetTop - 96, offsetTop - 96 + sidebarLimit],
    [0, sidebarLimit],
    { clamp: true },
  );

  const toc = resolveModuleConfig(blog, config, "toc", "toc", "template1");
  const share = resolveModuleConfig(blog, config, "share", "shareConfig", "template1");
  const search = resolveModuleConfig(blog, config, "search_box", "searchBox", "template1");
  const catList = resolveModuleConfig(blog, config, "category_list", "categoryList", "template1");
  const recommended = resolveModuleConfig(blog, config, "recommended_posts", "recommendedPosts", "template1");
  const follow = resolveModuleConfig(blog, config, "follow_us", "followUs", "template1");
  const footerCats = resolveModuleConfig(blog, config, "bottom_categories", "bottomCategories", "template1");
  const pagination = resolveModuleConfig(blog, config, "pagination", "pagination", "template1");
  const footerRec = resolveModuleConfig(blog, config, "bottom_recommended", "bottomRecommended", "template1");

  const showToc = toc.enabled;
  const showShare = share.enabled;
  const showSearch = search.enabled;
  const showCategoryList = catList.enabled;
  const showRecommended = recommended.enabled;
  const showFollowUs = follow.enabled;

  const isSidebarEnabled =
    showToc ||
    showShare ||
    showSearch ||
    showCategoryList ||
    showRecommended ||
    showFollowUs;

  const showFooterCategories = footerCats.enabled;
  const showPagination = pagination.enabled;
  const showFooterRecommended = footerRec.enabled;

  const isFooterEnabled =
    showFooterCategories || showPagination || showFooterRecommended;

  // Dynamic TOC extraction from content headings H2 and H3
  let extractedToc: { id: string; title: string }[] = [];
  if (showToc && blog.content?.root?.children) {
    const traverse = (nodes: any[]) => {
      for (const node of nodes) {
        // 1. Direct Headings
        if (
          node.type === "heading" &&
          (node.tag === "h2" || node.tag === "h3")
        ) {
          const text = node.children?.map((c: any) => c.text).join("") || "";
          if (text) {
            const id = text.toLowerCase().trim().replace(/\s+/g, "-");
            extractedToc.push({ id, title: text });
          }
        }
        
        // 2. Headings inside Blocks (Nested Content)
        if (node.type === "block") {
          const fields = node.fields || node.data || {};
          // Fluid Layout / Float Layout
          if (fields.content?.root?.children) {
            traverse(fields.content.root.children);
          }
          // Two Columns
          if (fields.leftColumn?.root?.children) {
            traverse(fields.leftColumn.root.children);
          }
          if (fields.rightColumn?.root?.children) {
            traverse(fields.rightColumn.root.children);
          }
        }

        // 3. Regular Children Recursion
        if (node.children) {
          traverse(node.children);
        }
      }
    };
    traverse(blog.content.root.children);
  }

  const tocItems = showToc
    ? blog.toc?.length > 0
      ? blog.toc
      : extractedToc.length > 0
        ? extractedToc
        : [{ id: "intro", title: locale === "zh" ? "简介" : "Introduction" }]
    : [];

  useEffect(() => {
    if (!showToc) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    tocItems.forEach((item: any) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [blog, tocItems, config?.showToc]);

  return (
    <article
      className="min-h-screen bg-white font-montserrat antialiased selection:bg-[#ff4848] selection:text-white"
      data-header-theme="light"
    >
      {/* 1. Post Header Info */}
      <div id="post-header" className="relative py-16 sm:py-32 overflow-x-clip">
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row">
          <div className="lg:w-5/12 text-center lg:text-left py-12 lg:py-0">
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-x-4 gap-y-1">
              <Link
                href={`/${locale}/blog`}
                className="uppercase bg-white/50 backdrop-blur-sm border border-[#DCDBD0] rounded-md px-4 py-2 text-[10px] font-bold tracking-widest block text-[#ff4848] hover:text-white hover:bg-[#ff4848] transition-all duration-300 w-fit lg:mx-0"
              >
                {blog.categories?.[0]?.name || "self-care"}
              </Link>
              <span className="font-extralight opacity-40">—</span>
              <p className="text-[#000000] text-xs font-medium">
                {formatDate(blog.publishedAt)}
              </p>
            </div>

            <h1 className="text-[43.2px] font-montserrat font-bold !leading-tight mb-4 text-[#000000]">
              {blog.title}
            </h1>

            <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-4 gap-y-2 uppercase text-[10px] font-bold tracking-[0.2em] text-[#000000] mb-12">
              <li className="flex items-center gap-3">
                <img
                  src={
                    blog.author?.avatar?.url ||
                    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=300&fit=crop"
                  }
                  alt={blog.author?.name || "Kathryn Jackson"}
                  className="w-6 h-6 rounded-full object-cover shadow-sm bg-[#DCDBD0]"
                />
                <Link
                  href="#"
                  className="hover:text-[#ff4848] transition-all duration-300 underline underline-offset-4"
                >
                  {blog.author?.name || "Kathryn Jackson"}
                </Link>
              </li>
              <li className="text-[#000000] opacity-40">•</li>
              <li>{getReadTime(blog.content)} MIN TO READ</li>
            </ul>
          </div>
        </div>

        <div className="lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-0 lg:w-1/2 w-full mt-12 lg:mt-0 px-6 lg:px-0 z-0 pointer-events-none">
          <div className="relative w-full aspect-[16/11] lg:aspect-[16/9]">
            <img
              className="lg:rounded-l-3xl rounded-3xl lg:rounded-r-none object-cover bg-dark/10 w-full h-full shadow-2xl pointer-events-auto"
              src={
                blog.coverImage ||
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
              }
              alt={blog.title}
            />
            <EyoloCornerRound className="absolute bottom-0 left-0 z-20 rotate-90 w-6 h-6 text-white" />
            <EyoloCornerRound className="absolute top-0 right-0 z-20 -rotate-90 w-6 h-6 text-white lg:hidden" />
            <div className="absolute -bottom-10 left-3 lg:-left-6 pointer-events-auto">
              <EyoloScrollBadge />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="lg:pt-20 pb-24">
        <div className="container mx-auto px-6">
          <div
            ref={containerRef}
            className="flex flex-col lg:flex-row gap-16 relative"
          >
            {/* Main Content Column */}
            <div
              className={
                isSidebarEnabled
                  ? "lg:w-8/12 xl:w-9/12"
                  : "w-full max-w-4xl mx-auto"
              }
            >
              <div
                id="post-content"
                className="max-w-none"
              >
                {blog.content ? (
                  <BlogLexicalRenderer
                    content={blog.content}
                    mediaData={blog.mediaData}
                  />
                ) : (
                  <p className="italic text-[#000000]">
                    Content loading or empty...
                  </p>
                )}
              </div>

              {/* Author Bio Section - Placed before recommendations */}
              <div className="mt-24 p-8 sm:p-12 bg-[#F5F2ED] rounded-[40px] flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left group">
                <div className="w-40 h-40 rounded-[30px] overflow-hidden flex-shrink-0 shadow-xl">
                  <img
                    src={
                      blog.author?.avatar?.url ||
                      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=300&fit=crop"
                    }
                    alt={blog.author?.name || "Kathryn Jackson"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div>
                  <h4 className="text-[24px] font-montserrat font-bold mb-2 text-[#000000]">
                    {blog.author?.name || "Kathryn Jackson"}
                  </h4>
                  <p className="text-[#ff4848] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                    {blog.author?.title || "Editorial Team"}
                  </p>
                  <p className="text-[#000000] text-[16px] leading-tight mb-4 max-w-xl italic">
                    {blog.author?.bio ||
                      "Passionate about structural beauty and engineering innovation."}
                  </p>
                </div>
              </div>

              {/* Dynamic Footer Features */}
              {isFooterEnabled && (
                <div className="mt-24 space-y-24">
                  {/* Category Dots */}
                  {showFooterCategories &&
                    footerCats.categories?.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-[#000000]">
                        {footerCats.categories.map(
                          (cat: any, i: number) => (
                            <span
                              key={cat.id}
                              className="flex items-center gap-4"
                            >
                              <Link
                                href={`/${locale}/blog?category=${cat.slug || cat.id}`}
                                className="hover:text-[#ff4848] transition-colors"
                              >
                                {cat.name}
                              </Link>
                              {i <
                                footerCats.categories.length -
                                  1 && <span className="opacity-20">•</span>}
                            </span>
                          ),
                        )}
                      </div>
                    )}

                  {/* Pagination - Previous / Next Post */}
                  {showPagination && (
                    <div className="flex flex-col sm:flex-row items-stretch border-t border-[#F0EBE6] mt-24">
                      {(() => {
                        const prev = pagination.type === 'manual' ? pagination.prev_post : blog.prevPost;
                        const next = pagination.type === 'manual' ? pagination.next_post : blog.nextPost;
                        
                        const renderLink = (item: any, label: string, align: 'left' | 'right') => {
                          if (!item) return <div className={`flex-1 hidden sm:block ${align === 'left' ? 'border-r' : ''} border-[#F0EBE6]`} />;
                          
                          const title = item.title || (typeof item === 'string' ? "Post" : "");
                          const slug = item.slug || (typeof item === 'string' ? item : "");

                          if (!title && !slug) return <div className={`flex-1 hidden sm:block ${align === 'left' ? 'border-r' : ''} border-[#F0EBE6]`} />;

                          return (
                            <Link
                              href={`/${locale}/blog/${slug}`}
                              className={`flex-1 py-12 ${align === 'left' ? 'pr-10 border-r' : 'pl-10 text-right items-end'} flex flex-col gap-3 group border-[#F0EBE6] hover:bg-[#F5F2ED]/50 transition-colors`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#000000]">
                                {label}
                              </span>
                              <h5 className="text-[18px] font-montserrat text-[#000000] group-hover:text-[#ff4848] transition-colors line-clamp-2 leading-tight">
                                {title || "Read Post"}
                              </h5>
                            </Link>
                          );
                        };

                        return (
                          <>
                            {renderLink(prev, locale === 'zh' ? '上一篇' : 'Previous Post', 'left')}
                            {renderLink(next, locale === 'zh' ? '下一篇' : 'Next Post', 'right')}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Recommendations */}
                  {showFooterRecommended &&
                    footerRec.posts?.length > 0 && (
                      <div className="border-t border-[#F0EBE6] pt-16">
                        <div className="text-center mb-12">
                          <h4 className="text-[24px] font-montserrat text-[#000000]">
                            {footerRec.title ||
                              "Recommended Stories"}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                          {footerRec.posts.map((p: any) => (
                            <div key={p.id} className="group">
                              <Link
                                href={`/${locale}/blog/${p.slug}`}
                                className="block relative aspect-[4/3] rounded-2xl overflow-hidden mb-6"
                              >
                                <img
                                  src={p.coverImage?.url || p.coverImage}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  alt={p.title}
                                />
                              </Link>
                              <h5 className="text-lg font-montserrat hover:text-[#ff4848] transition-colors line-clamp-2">
                                {p.title}
                              </h5>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            {isSidebarEnabled && (
              <div className="lg:w-4/12 xl:w-3/12 hidden lg:block relative">
                <motion.div
                  ref={sidebarRef}
                  style={{ y: sidebarY }}
                  className="space-y-16"
                >
                  {showToc && tocItems.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#000000] mb-4 pb-4 border-b border-[#F0EBE6] flex items-center gap-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4848]" />
                          {toc.title || "In this story"}
                        </h4>
                      <nav>
                        <ul className="space-y-8">
                          {tocItems.map((item: any) => (
                            <li
                              key={item.id}
                              className="group flex items-center gap-4"
                            >
                              <span
                                className={`h-[2px] bg-[#ff4848] transition-all duration-300 ${activeSection === item.id ? "w-5" : "w-0"}`}
                              />
                              <Link
                                href={`#${item.id}`}
                                className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeSection === item.id ? "text-[#ff4848] translate-x-1" : "text-[#000000] hover:text-[#ff4848]"}`}
                              >
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  )}

                    {/* Search Box Widget */}
                    {showSearch && (
                      <div className="pt-8 border-t border-[#F0EBE6]">
                        <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-[#000000]">
                          Search
                        </h5>
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder={search.placeholder || "Search..."}
                            spellCheck="false"
                            className="w-full bg-[#F5F2ED] border-0 rounded-xl px-5 py-4 text-xs focus:ring-1 focus:ring-[#ff4848] outline-none transition-all"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000000]">
                            <IconifyIcon name="lucide:search" size={16} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Share Post Widget */}
                    {showShare && (
                      <div className="pt-8 border-t border-[#F0EBE6]">
                        <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-[#000000]">
                          {share.title || "Share Post"}
                        </h5>
                        <div className="flex gap-4">
                          {share.networks?.map(
                            (net: any, i: number) => {
                              const shareUrl = net.url
                                ?.replace(
                                  "{{URL}}",
                                  encodeURIComponent(
                                    typeof window !== "undefined"
                                      ? window.location.href
                                      : "",
                                  ),
                                )
                                ?.replace(
                                  "{{TITLE}}",
                                  encodeURIComponent(blog.title || ""),
                                );

                              return (
                                <a
                                  key={i}
                                  href={shareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-full border border-[#DCDBD0] flex items-center justify-center text-[#000000] hover:bg-[#ff4848] hover:border-[#ff4848] hover:text-white transition-all cursor-pointer group"
                                >
                                  <IconifyIcon name={net.icon} size={18} />
                                </a>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}

                    {/* Category List Widget */}
                    {showCategoryList && catList.categories?.length > 0 && (
                      <div className="pt-8 border-t border-[#F0EBE6]">
                        <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-[#000000]">
                          {catList.title || "Categories"}
                        </h5>
                        <ul className="space-y-4">
                          {catList.categories.map((cat: any) => (
                            <li key={cat.id}>
                              <Link
                                href={`/${locale}/blog?category=${cat.slug || cat.id}`}
                                className="text-[12px] font-bold uppercase tracking-widest hover:text-[#ff4848] transition-colors flex justify-between items-center"
                              >
                                {cat.name}
                                <IconifyIcon name="lucide:chevron-right" size={12} className="opacity-20" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Posts Widget */}
                    {showRecommended &&
                      recommended.posts?.length > 0 && (
                        <div className="pt-8 border-t border-[#F0EBE6]">
                          <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-[#000000]">
                            {recommended.title || "Recommended"}
                          </h5>
                          <div className="space-y-6">
                            {recommended.posts
                              .slice(0, 3)
                              .map((rp: any) => (
                                <Link
                                  key={rp.id}
                                  href={`/${locale}/blog/${rp.slug}`}
                                  className="group block"
                                >
                                  <h6 className="text-[13px] font-bold uppercase leading-tight text-[#000000] group-hover:text-[#ff4848] transition-colors line-clamp-2">
                                    {rp.title}
                                  </h6>
                                </Link>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Follow Us Widget */}
                    {showFollowUs && follow.socials?.length > 0 && (
                      <div className="pt-8 border-t border-[#F0EBE6]">
                        <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-[#000000]">
                          {follow.title || "Follow Us"}
                        </h5>
                        <div className="flex flex-wrap gap-3">
                          {follow.socials.map((social: any, idx: number) => (
                            <a
                              key={idx}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-[#000000] flex items-center justify-center text-white hover:bg-[#ff4848] transition-all"
                            >
                              <IconifyIcon name={social.icon} size={18} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
