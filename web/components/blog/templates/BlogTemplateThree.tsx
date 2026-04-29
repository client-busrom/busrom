"use client";

import type { Locale } from "@/i18n.config";
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { resolveModuleConfig } from "@/lib/blog-config-utils";

interface BlogTemplateProps {
  blog: any;
  locale: Locale;
  formatDate: (date: string) => string;
  config: any;
}

export function BlogTemplateThree({
  blog,
  locale,
  formatDate,
  config,
}: BlogTemplateProps) {
  // Reference: https://reland-nextjs.vercel.app/blog-details
  // "Modern Corporate Detail" with sand background (#fbfcf4), 8:4 grid, and structured sidebar

  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number }[]
  >([]);

  const toc = resolveModuleConfig(blog, config, "toc", "toc", "template3");
  const share = resolveModuleConfig(blog, config, "share", "shareConfig", "template3");
  const search = resolveModuleConfig(blog, config, "search_box", "searchBox", "template3");
  const catList = resolveModuleConfig(blog, config, "category_list", "categoryList", "template3");
  const recommended = resolveModuleConfig(blog, config, "recommended_posts", "recommendedPosts", "template3");
  const follow = resolveModuleConfig(blog, config, "follow_us", "followUs", "template3");
  const footerCats = resolveModuleConfig(blog, config, "bottom_categories", "bottomCategories", "template3");
  const pagination = resolveModuleConfig(blog, config, "pagination", "pagination", "template3");
  const footerRec = resolveModuleConfig(blog, config, "bottom_recommended", "bottomRecommended", "template3");

  const showToc = toc.enabled;
  const showShare = share.enabled;
  const showSearch = search.enabled;
  const showCategoryList = catList.enabled;
  const showRecommended = recommended.enabled;
  const showFollowUs = follow.enabled;

  const showSidebar =
    showToc ||
    showShare ||
    showSearch ||
    showCategoryList ||
    showRecommended ||
    showFollowUs;

  const showFooterCategories = footerCats.enabled;
  const showPagination = pagination.enabled;
  const showFooterRecommended = footerRec.enabled;

  const showFooter =
    showFooterCategories || showPagination || showFooterRecommended;

  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(
        "#blog-content h1, #blog-content h2, #blog-content h3, #blog-content h4",
      );
      const extracted = Array.from(elements).map((el: any) => {
        if (!el.id) {
          el.id = el.innerText
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");
        }
        return {
          id: el.id,
          text: el.innerText,
          level: parseInt(el.tagName.replace("H", "")),
        };
      });
      setHeadings(extracted);
    }, 500);
    return () => clearTimeout(timer);
  }, [blog.content]);

  useEffect(() => {
    if (!showToc) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) setActiveId(visibleEntry.target.id);
      },
      { rootMargin: "-80px 0% -80% 0%" },
    );

    document
      .querySelectorAll("#blog-content h1, #blog-content h2, #blog-content h3")
      .forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [blog, showToc]);

  return (
    <article className="min-h-screen bg-[#fbfcf4] font-mulish antialiased text-[#060C14] pb-24">
      <div className="container mx-auto px-6 lg:px-12 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* LEFT COLUMN: Main Content */}
          <div
            className={
              showSidebar
                ? "lg:col-span-8"
                : "lg:col-span-12 max-w-[1000px] mx-auto"
            }
          >
            <header className="mb-10">
              <h1 className="text-[32px] md:text-[46px] font-bold font-prata leading-tight mb-6 text-[#060C14]">
                {blog.title}
              </h1>
              <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-400">
                <span>{formatDate(blog.publishedAt)}</span>
                <span>•</span>
                <span className="text-[#ff4848]">
                  {blog.author?.name || blog.author || "Busrom Editorial"}
                </span>
              </div>
            </header>

            {/* Featured Image */}
            {blog.coverImage && (
              <div className="mb-12 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
                <img
                  src={blog.coverImage?.url || blog.coverImage}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Body Content */}
            <div
              id="blog-content"
              className="prose prose-lg max-w-none text-[#060C14]/80 leading-relaxed font-lexend-deca italic-none"
            >
              <LexicalRenderer
                content={blog.content}
                mediaData={blog.mediaData}
              />
            </div>

            {/* Author Bio Box */}
            {blog.author && (
              <div className="mt-16 p-8 md:p-12 bg-[#f4f5e6] rounded-[40px] flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 shadow-lg bg-white/50">
                  <img
                    src={
                      typeof blog.author === 'object' && blog.author?.avatar?.url 
                        ? blog.author.avatar.url 
                        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                    }
                    alt="Author"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold font-prata">
                    {typeof blog.author === 'object' ? blog.author?.name : (blog.author || "Busrom Editorial")}
                  </h4>
                  <p className="text-gray-500 leading-relaxed italic opacity-80">
                    {typeof blog.author === 'object' && blog.author?.bio 
                      ? blog.author.bio 
                      : "Specializing in structural glass systems and modern architectural solutions for global enterprises."}
                  </p>
                  <div className="flex justify-center md:justify-start gap-4">
                    <Link
                      href="#"
                      className="text-[11px] font-bold uppercase tracking-widest border-b border-[#060C14] pb-1"
                    >
                      {locale === "zh" ? "查看资料" : "View Profile"}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Content Footer (Categories & Pagination) */}
            {(showFooterCategories || showPagination) && (
              <div className="mt-20 pt-16 border-t border-gray-100 space-y-16">
                {/* Category Tags */}
                {showFooterCategories && footerCats.categories?.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {footerCats.categories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        href={`/${locale}/blog?category=${cat.slug || cat.id}`}
                        className="px-6 py-2.5 rounded-full border border-gray-200 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:border-[#060C14] hover:text-[#060C14] transition-all"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pagination (Previous / Next Post) */}
                {showPagination && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(() => {
                      const prev =
                        pagination.type === "manual"
                          ? pagination.prev_post
                          : blog.prevPost;
                      const next =
                        pagination.type === "manual"
                          ? pagination.next_post
                          : blog.nextPost;

                      // Helper to render a link block
                      const renderLink = (item: any, label: string, align: "left" | "right") => {
                        if (!item) return <div className="hidden md:block" />;
                        
                        // Handle both object and string ID
                        const title = item.title || (typeof item === 'string' ? "Post" : "");
                        const slug = item.slug || (typeof item === 'string' ? item : "");

                        if (!title && !slug) return <div className="hidden md:block" />;

                        return (
                          <Link
                            href={`/${locale}/blog/${slug}`}
                            className={`group p-8 md:p-10 bg-white rounded-[32px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all ${align === "right" ? "text-right" : ""}`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff4848] block mb-4">
                              {label}
                            </span>
                            <h4 className="text-xl md:text-2xl font-prata text-[#060C14] group-hover:text-[#ff4848] transition-colors leading-tight line-clamp-2">
                              {title || "Read Post"}
                            </h4>
                          </Link>
                        );
                      };

                      return (
                        <>
                          {renderLink(prev, "Previous", "left")}
                          {renderLink(next, "Next", "right")}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          {showSidebar && (
            <aside className="lg:col-span-4 space-y-12">
              {/* Search Box */}
              {showSearch && (
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={search.placeholder || "Search article..."}
                    className="w-full bg-white border-2 border-transparent focus:border-[#ff4848]/20 rounded-2xl px-6 py-5 text-sm focus:outline-none shadow-sm placeholder:text-gray-300 transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff4848] transition-colors">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
              )}

              {/* Table of Contents */}
              {showToc && headings.length > 0 && (
                <div className="p-8 bg-white rounded-3xl shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#060C14] mb-10 pb-4 border-b border-[#F0EBE6] flex items-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4848]" />
                    {toc.title || "Table of Contents"}
                  </h4>
                  <nav className="space-y-5">
                    {headings.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block text-sm font-bold leading-snug transition-all ${
                          activeId === h.id
                            ? "text-[#ff4848]"
                            : "text-[#060C14] hover:text-[#ff4848]"
                        }`}
                        style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .getElementById(h.id)
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Social Share */}
              {showShare && (
                <div className="p-8 bg-white rounded-3xl shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#060C14] mb-10 pb-4 border-b border-[#F0EBE6] flex items-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4848]" />
                    {share.title || "Share This"}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {(share.networks && share.networks.length > 0
                      ? share.networks
                      : [
                          {
                            icon: "ri:facebook-fill",
                            url: "https://facebook.com/sharer/sharer.php?u={{URL}}",
                          },
                          {
                            icon: "ri:twitter-x-fill",
                            url: "https://twitter.com/intent/tweet?url={{URL}}",
                          },
                          {
                            icon: "ri:linkedin-fill",
                            url: "https://www.linkedin.com/sharing/share-offsite/?url={{URL}}",
                          },
                        ]
                    ).map((network: any, idx: number) => {
                      const shareUrl = network.url
                        ?.replace(
                          "{{URL}}",
                          encodeURIComponent(
                            typeof window !== "undefined"
                              ? window.location.href
                              : "",
                          ),
                        )
                        ?.replace("{{TITLE}}", encodeURIComponent(blog.title));

                      return (
                        <a
                          key={idx}
                          href={shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#ff4848] hover:border-[#ff4848] hover:text-white transition-all group shrink-0"
                        >
                          <IconifyIcon name={network.icon} size={18} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category List */}
              {showCategoryList && (
                <div className="p-8 bg-white rounded-3xl shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#060C14] mb-10 pb-4 border-b border-[#F0EBE6] flex items-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4848]" />
                    {catList.title || "Categories"}
                  </h4>
                  <ul className="space-y-4">
                    {(catList.categories?.length > 0
                      ? catList.categories
                      : blog.categories || []
                    ).map((cat: any) => (
                      <li key={cat.id}>
                        <Link
                          href={`/${locale}/blog?category=${cat.slug || cat.id}`}
                          className="text-sm font-bold hover:text-[#ff4848] transition-colors flex justify-between items-center group"
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4848] opacity-0 group-hover:opacity-100 transition-all"></span>
                            {cat.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Posts (Sidebar) */}
              {showRecommended && (
                <div className="p-8 bg-white rounded-3xl shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#060C14] mb-10 pb-4 border-b border-[#F0EBE6] flex items-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4848]" />
                    {recommended.title || "Recommended"}
                  </h4>
                  <div className="space-y-8">
                    {(recommended.posts?.length > 0 ? recommended.posts : [])
                      .slice(0, 3)
                      .map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/${locale}/blog/${p.slug}`}
                          className="group flex gap-4 items-start"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                            <img
                              src={p.coverImage?.url || p.coverImage}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              alt=""
                            />
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-sm font-bold leading-snug group-hover:text-[#ff4848] transition-colors line-clamp-2">
                              {p.title}
                            </h5>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                              {formatDate(p.publishedAt)}
                            </span>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {/* Follow Us */}
              {showFollowUs && (
                <div className="p-8 bg-white rounded-3xl shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#060C14] mb-10 pb-4 border-b border-[#F0EBE6] flex items-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4848]" />
                    {follow.title || "Follow Us"}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {(follow.socials?.length > 0
                      ? follow.socials
                      : [
                          { icon: "ri:facebook-fill", url: "#" },
                          { icon: "ri:twitter-x-fill", url: "#" },
                          { icon: "ri:linkedin-fill", url: "#" },
                          { icon: "ri:instagram-line", url: "#" },
                        ]
                    ).map((social: any, idx: number) => (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#ff4848] hover:border-[#ff4848] hover:text-white transition-all shrink-0"
                      >
                        <IconifyIcon name={social.icon} size={18} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* Recommended Posts (Configurable Section) */}
      {showFooterRecommended && footerRec.posts?.length > 0 && (
        <div className="container mx-auto px-6 lg:px-12 mt-24 pt-20 border-t border-gray-100">
          <div className="flex justify-between items-end mb-16">
            <h3 className="text-4xl lg:text-6xl font-prata text-[#060C14]">
              {footerRec.title || "Recommended Stories"}
            </h3>
            <Link
              href={`/${locale}/blog`}
              className="text-[11px] font-black uppercase tracking-widest border-b-2 border-[#ff4848] pb-1"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {footerRec.posts.map((p: any, idx: number) => (
              <div key={p.id || idx} className="space-y-6 group cursor-pointer">
                <Link
                  href={`/${locale}/blog/${p.slug}`}
                  className="block aspect-[16/10] rounded-[32px] overflow-hidden shadow-xl shadow-black/5"
                >
                  <img
                    src={
                      p.coverImage?.url ||
                      p.coverImage ||
                      `https://images.unsplash.com/photo-${1500000000000 + idx * 200000}?w=600`
                    }
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt=""
                  />
                </Link>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff4848] block mb-3">
                    {p.categories?.[0]?.name}
                  </span>
                  <Link
                    href={`/${locale}/blog/${p.slug}`}
                    className="text-2xl font-bold leading-tight group-hover:text-[#ff4848] transition-colors line-clamp-2"
                  >
                    {p.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
