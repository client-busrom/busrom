"use client";

import { useState, useEffect, useMemo } from "react";
import type { Locale } from "@/i18n.config";
import Link from "next/link";
import {
  EyoloCornerBridge,
  EyoloCircleArrow,
} from "@/components/blog/ReplicaAssets";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// Import Refactored Gallery Templates
import { GalleryTemplateOne } from "./components/GalleryTemplateOne";
import { GalleryTemplateTwo } from "./components/GalleryTemplateTwo";
import { GalleryTemplateThree } from "./components/GalleryTemplateThree";
import { GalleryTemplateFour } from "./components/GalleryTemplateFour";

interface BlogListClientProps {
  locale: Locale;
  initialConfig?: any;
  initialBlogs?: any[];
  allLabel?: string;
}

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
export const safeImage = (img: any) => {
  if (typeof img === "number") return null;
  return img;
};

export function BlogListClient({
  locale,
  initialConfig,
  initialBlogs,
  allLabel,
}: BlogListClientProps) {
  const [blogs, setBlogs] = useState<any[]>(initialBlogs || []);
  const [config, setConfig] = useState<any>(initialConfig || null);
  const [loading, setLoading] = useState(!initialConfig);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    // If we have no config or blogs, try a fresh fetch
    if (!config || (blogs.length === 0 && !initialBlogs)) {
      const fetchData = async () => {
        try {
          const configRes = await fetch(
            `/api/payload/globals/knowledge-base-settings?locale=${locale}&depth=2`,
          );
          if (configRes.ok) {
            const activeConfig = await configRes.json();
            setConfig(activeConfig);
          }

          if (blogs.length === 0) {
            const blogsRes = await fetch(
              `/api/payload/blogs?locale=${locale}&limit=10&where[status][equals]=published`,
            );
            if (blogsRes.ok) {
              const blogsData = await blogsRes.json();
              setBlogs(blogsData.docs || []);
            }
          }
        } catch (err) {
          console.error("Error client fetching blog data:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [locale, config, blogs.length, initialBlogs]);

  // Create a flattened articles pool from categories for tag-based filtering
  const articlePool = useMemo(() => {
    if (!config?.kbCategoryTabs) return [];
    const allPosts: any[] = [];
    const seenIds = new Set();

    config.kbCategoryTabs.forEach((tab: any) => {
      if (Array.isArray(tab.blogPosts)) {
        tab.blogPosts.forEach((post: any) => {
          if (post && post.id && !seenIds.has(post.id)) {
            allPosts.push(post);
            seenIds.add(post.id);
          }
        });
      }
    });
    return allPosts;
  }, [config?.kbCategoryTabs]);

  // Process sections and inject items based on tags
  const processedSections = useMemo(() => {
    if (!config?.sectionsData) return [];

    let rawSections =
      config.sectionsData[locale] || config.sectionsData["en"] || [];
    if (Array.isArray(config.sectionsData)) rawSections = config.sectionsData;

    return (rawSections as any[])
      .filter((s) => !!s) // Remove any null/undefined holes
      .map((section, idx) => {
        if (!section) return null;
        // 1. Resolve Template (Auto-fix for Template 1 if None)
        let template = section.template;
        if (
          !template &&
          (idx === 0 || section.tagTitle?.toLowerCase().includes("latest"))
        ) {
          template = "template1";
        }

        // 2. Resolve Items (If items empty, filter from pool by tag ID)
        let items = section.items || [];
        if ((!items || items.length === 0) && section.tag) {
          const tagId =
            typeof section.tag === "object" ? section.tag.id : section.tag;
          items = articlePool.filter((post: any) => {
            return post.tags?.some(
              (t: any) => (typeof t === "object" ? t.id : t) === tagId,
            );
          });
        }

        // Also support direct template names like "Template 1"
        if (template?.toLowerCase().includes("1")) template = "template1";
        if (template?.toLowerCase().includes("2")) template = "template2";
        if (template?.toLowerCase().includes("3")) template = "template3";
        if (template?.toLowerCase().includes("4")) template = "template4";

        return {
          ...section,
          template,
          items: items.length > 0 ? items : blogs.slice(0, 4), // Fallback to latest blogs if still empty
        };
      })
      .filter((s) => !!s); // Final safety filter
  }, [config?.sectionsData, locale, articlePool, blogs]);

  const hero = {
    tag: config?.heroTitle || (locale === "zh" ? "本周推荐" : "FEATURED"),
    post: config?.featuredPost || (blogs.length > 0 ? blogs[0] : null),
  };

  const categoryTabs = config?.kbCategoryTabs || [];

  return (
    <div
      className="min-h-screen bg-[#F6F4ED] font-lexend-deca antialiased selection:bg-[#ff4848] selection:text-white"
      data-header-theme="light"
    >
      {/* 1. HERO BANNER - SPLIT LAYOUT */}
      {hero.post && (
        <section className="mt-8 sm:pt-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              {/* LEFT COLUMN - HEADER & METADATA (7 Columns) */}
              <div className="lg:col-span-7 flex flex-col">
                {/* Article Metadata Card with Bridge */}
                <article className="transition-all duration-500 bg-[#756f3f] group relative rounded-[32px] rounded-tr-none text-center px-4 sm:px-8 md:px-12 py-10 sm:py-16 mt-4 sm:mt-8 flex-1 flex flex-col justify-center shadow-xl">
                  {/* The exact bridge SVG from the snippet, now matching card color to stretch upwards */}
                  <div className="absolute -top-[31px] right-0 flex">
                    <svg
                      className="text-[#756f3f] relative -right-px"
                      width="86"
                      height="32"
                      viewBox="0 0 86 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M85.3511 32H0C8.17473 32 15.7118 28.9386 19.7164 23.9923L32.6592 8.00769C36.6639 3.06146 44.2025 0 52.3758 0H85.3511V32Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <div className="h-8 bg-[#756f3f] w-32 sm:w-52 rounded-tr-[32px]"></div>
                  </div>

                  {/* Featured Badge */}
                  <h2 className="text-[16px] uppercase font-bold tracking-widest pl-7 pr-4 py-[6px] after:absolute after:rounded-full after:content-[''] after:h-[6px] after:w-[6px] after:bg-[#ff4848] after:left-[14px] after:top-[16px] text-white absolute bg-white/10 backdrop-blur-md -top-4 right-4 rounded-full border border-white/10">
                    {hero.tag || "Featured Post"}
                  </h2>

                  <div className="mt-4 text-white">
                    <span className="text-[11px] flex gap-2 items-center justify-center mb-6 uppercase font-bold tracking-[0.2em] text-[#E7E5D4]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6663 2.66677H11.333V2.0001C11.333 1.82329 11.2628 1.65372 11.1377 1.5287C11.0127 1.40367 10.8432 1.33344 10.6663 1.33344C10.4895 1.33344 10.32 1.40367 10.1949 1.5287C10.0699 1.65372 9.99967 1.82329 9.99967 2.0001V2.66677H5.99967V2.0001C5.99967 1.82329 5.92944 1.65372 5.80441 1.5287C5.67939 1.40367 5.50982 1.33344 5.33301 1.33344C5.1562 1.33344 4.98663 1.40367 4.8616 1.5287C4.73658 1.65372 4.66634 1.82329 4.66634 2.0001V2.66677H3.33301C2.80257 2.66677 2.29387 2.87748 1.91879 3.25255C1.54372 3.62763 1.33301 4.13633 1.33301 4.66677V12.6668C1.33301 13.1972 1.54372 13.7059 1.91879 14.081C2.29387 14.4561 2.80257 14.6668 3.33301 14.6668H12.6663C13.1968 14.6668 13.7055 14.4561 14.0806 14.081C14.4556 13.7059 14.6663 13.1972 14.6663 12.6668V4.66677C14.6663 4.13633 14.4556 3.62763 14.0806 3.25255C13.7055 2.87748 13.1968 2.66677 12.6663 2.66677ZM13.333 12.6668C13.333 12.8436 13.2628 13.0131 13.1377 13.1382C13.0127 13.2632 12.8432 13.3334 12.6663 13.3334H3.33301C3.1562 13.3334 2.98663 13.2632 2.8616 13.1382C2.73658 13.0131 2.66634 12.8436 2.66634 12.6668V8.0001H13.333V12.6668ZM13.333 6.66677H2.66634V4.66677C2.66634 4.48996 2.73658 4.32039 2.8616 4.19536C2.98663 4.07034 3.1562 4.0001 3.33301 4.0001H4.66634V4.66677C4.66634 4.84358 4.73658 5.01315 4.8616 5.13817C4.98663 5.2632 5.1562 5.33343 5.33301 5.33343C5.50982 5.33343 5.67939 5.2632 5.80441 5.13817C5.92944 5.01315 5.99967 4.84358 5.99967 4.66677V4.0001H9.99967V4.66677C9.99967 4.84358 10.0699 5.01315 10.1949 5.13817C10.32 5.2632 10.4895 5.33343 10.6663 5.33343C10.8432 5.33343 11.0127 5.2632 11.1377 5.13817C11.2628 5.01315 11.333 4.84358 11.333 4.66677V4.0001H12.6663C12.8432 4.0001 13.0127 4.07034 13.1377 4.19536C13.2628 4.32039 13.333 4.48996 13.333 4.66677V6.66677Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                      {hero.post.publishedAt
                        ? new Date(hero.post.publishedAt).toLocaleDateString()
                        : "May 20, 2024"}
                    </span>

                    <Link href={`/${locale}/blog/${hero.post.slug}`}>
                      <h3 className="text-3xl sm:text-4xl lg:text-[40px] text-white font-prata !leading-[1.3] line-clamp-3 hover:text-gray-200 transition-colors mb-6 mx-auto">
                        {hero.post.title}
                      </h3>
                    </Link>

                    <ul className="flex flex-wrap items-center justify-center gap-3 gap-y-1 uppercase text-xs font-bold mt-8 mb-6 tracking-widest text-white">
                      <li className="flex items-center text-white">
                        {hero.post.author?.avatar && (
                          <OptimizedImage
                            image={safeImage(hero.post.author.avatar)}
                            alt={hero.post.author.name}
                            size="small"
                            className="h-6 w-6 border border-white/40 rounded-full mr-3 object-cover"
                          />
                        )}
                        {hero.post.author?.name || "Kathryn Jackson"}
                      </li>
                      <li>•</li>
                      <li>{hero.post.readTime || "02"} MIN TO READ</li>
                    </ul>

                    <Link
                      className="h-14 w-14 lg:h-16 lg:w-16 mx-auto flex items-center justify-center text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group-hover:rotate-45"
                      href={`/${locale}/blog/${hero.post.slug}`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Link>
                  </div>
                </article>
              </div>

              {/* RIGHT COLUMN - SIMPLE IMAGE & CATEGORY (5 Columns) */}
              <div className="lg:col-span-5 relative hidden lg:flex flex-col h-full lg:min-h-[600px] rounded-[32px] overflow-hidden ml-0 lg:ml-4 bg-[#E7E5D4]">
                {/* Main Cover Image */}
                <div className="absolute inset-0 w-full h-full">
                  <OptimizedImage
                    image={safeImage(hero.post.coverImage)}
                    alt={hero.post.title}
                    size="xlarge"
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                    priority
                  />
                </div>

                {/* Simple Category Badge */}
                <div className="absolute bottom-8 left-8 z-20">
                  <Link
                    href={`/${locale}/blog/category/${hero.post.categories?.[0]?.slug || "all"}`}
                    className="inline-block px-8 py-3 bg-white/90 backdrop-blur-md rounded-full uppercase text-[11px] font-bold tracking-widest text-[#060C14] hover:bg-[#060C14] hover:text-white transition-colors border border-black/5"
                  >
                    {hero.post.categories?.[0]?.name || "Uncategorized"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. POPULAR TOPICS - RESTORED PREMIUM HOVER EFFECT */}
      <section className="bg-transparent py-24 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="mb-14 text-center">
            <h2 className="text-xs uppercase font-bold tracking-[0.3em] inline-flex items-center text-[#060C14] pl-4 relative after:absolute after:rounded-full after:content-[''] after:h-2 after:w-2 after:bg-[#ff4848] after:left-0">
              POPULAR TOPICS
            </h2>
          </div>

          <ul className="text-center flex flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-x-10 lg:gap-x-14 font-prata text-black">
            {/* ALL Category */}
            <li className="relative group transition-all duration-300 list-none">
              <button
                onClick={() => setActiveCategory("all")}
                className="inline-block relative"
              >
                <span
                  className={`transition-all duration-100 relative z-30 text-3xl sm:text-4xl lg:text-5xl capitalize ${activeCategory === "all" ? "text-[#ff4848]" : "group-hover:text-white group-hover:drop-shadow-lg"}`}
                >
                  {allLabel || "all"}
                </span>
                {/* Floating Preview Image */}
                <span className="absolute h-[100px] lg:h-[130px] w-[200px] lg:w-[250px] left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 opacity-0 invisible scale-90 -rotate-12 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:scale-100 overflow-hidden rounded-2xl z-20 pointer-events-none mt-4 group-hover:mt-0 shadow-2xl">
                  <OptimizedImage
                    image={safeImage(blogs[0]?.coverImage)}
                    alt="All Categories"
                    size="medium"
                    className="object-cover h-full w-full scale-125 group-hover:scale-100 transition-all duration-300"
                  />
                </span>
              </button>
              <span className="ml-4 sm:ml-10 lg:ml-14 opacity-10 text-3xl sm:text-4xl lg:text-5xl font-light">
                /
              </span>
            </li>

            {categoryTabs.map((tab: any, idx: number) => {
              const previewPost = tab.blogPosts?.[0];
              return (
                <li
                  key={tab.id}
                  className="relative group transition-all duration-300 list-none"
                >
                  <button
                    onClick={() => setActiveCategory(tab.id)}
                    className="inline-block relative"
                  >
                    <span
                      className={`transition-all duration-100 relative z-30 text-3xl sm:text-4xl lg:text-5xl capitalize ${activeCategory === tab.id ? "text-[#ff4848]" : "group-hover:text-white group-hover:drop-shadow-lg"}`}
                    >
                      {tab.name}
                    </span>
                    {/* Floating Preview Image */}
                    <span className="absolute h-[100px] lg:h-[130px] w-[200px] lg:w-[250px] left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 opacity-0 invisible scale-90 -rotate-12 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:scale-100 overflow-hidden rounded-2xl z-20 pointer-events-none mt-4 group-hover:mt-0 shadow-2xl">
                      <OptimizedImage
                        image={safeImage(previewPost?.coverImage)}
                        alt={tab.name}
                        size="medium"
                        className="object-cover h-full w-full scale-125 group-hover:scale-100 transition-all duration-300"
                      />
                    </span>
                  </button>
                  {idx < categoryTabs.length - 1 && (
                    <span className="ml-4 sm:ml-10 lg:ml-14 opacity-10 text-3xl sm:text-4xl lg:text-5xl font-light">
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 3. DYNAMIC SECTIONS */}
      {processedSections.length > 0
        ? processedSections.map((section: any, idx: number) => (
            <DynamicSection key={idx} section={section} locale={locale} />
          ))
        : !loading && (
            <div className="py-24 text-center">
              <p className="text-gray-400 italic">
                No sections found for this configuration.
              </p>
            </div>
          )}
    </div>
  );
}

function DynamicSection({ section, locale }: any) {
  const template = section.template;
  const items = section.items || [];

  if (!template) return null;

  switch (template) {
    case "template1":
      return (
        <GalleryTemplateOne section={section} items={items} locale={locale} />
      );
    case "template2":
      return (
        <GalleryTemplateTwo section={section} items={items} locale={locale} />
      );
    case "template3":
      return (
        <GalleryTemplateThree section={section} items={items} locale={locale} />
      );
    case "template4":
      return (
        <GalleryTemplateFour section={section} items={items} locale={locale} />
      );
    default:
      return null;
  }
}
