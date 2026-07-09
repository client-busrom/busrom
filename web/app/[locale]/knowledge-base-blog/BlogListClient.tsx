"use client";

import { useState, useEffect, useMemo } from "react";
import type { Locale } from "@/i18n.config";
import { GalleryTemplateOne } from "./components/GalleryTemplateOne";
import { GalleryTemplateTwo } from "./components/GalleryTemplateTwo";
import { GalleryTemplateThree } from "./components/GalleryTemplateThree";
import { GalleryTemplateFour } from "./components/GalleryTemplateFour";
import { HeroBanner } from "./components/HeroBanner";
import { PopularTopics } from "./components/PopularTopics";

interface BlogListClientProps {
  locale: Locale;
  initialConfig?: any;
  initialBlogs?: any[];
  allLabel?: string;
  pageTitle?: string;
}

// Helper to prevent OptimizedImage from crashing on raw IDs (numbers)
export const safeImage = (img: any) => {
  if (!img) return null;
  if (typeof img === "number") return null;
  if (typeof img === "string" && !img.includes("/") && !img.includes(".")) return null;
  return img;
};

export function BlogListClient({
  locale,
  initialConfig,
  initialBlogs,
  allLabel,
  pageTitle,
}: BlogListClientProps) {
  const [blogs, setBlogs] = useState<any[]>(initialBlogs || []);
  const [config, setConfig] = useState<any>(initialConfig || null);
  const [hydratedPosts, setHydratedPosts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(!initialConfig);

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
            // Future-dated featured posts should not appear on the frontend
            if (
              activeConfig.featuredPost &&
              activeConfig.featuredPost.publishedAt &&
              new Date(activeConfig.featuredPost.publishedAt).getTime() > Date.now()
            ) {
              activeConfig.featuredPost = null;
            }
            setConfig(activeConfig);
          }

          if (blogs.length === 0) {
            const now = new Date()
            now.setSeconds(0, 0)
            const blogsRes = await fetch(
              `/api/payload/blogs?locale=${locale}&limit=10&where[status][equals]=published&where[publishedAt][less_than_equal]=${encodeURIComponent(now.toISOString())}&depth=2`,
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

  // Hydrate missing cover images for preview posts that only have IDs (due to depth limits)
  const [hydratedAuthors, setHydratedAuthors] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!config?.kbCategoryTabs) return;

    const missingIds: string[] = [];
    
    if (config.featuredPost) {
      const pId = typeof config.featuredPost === 'object' ? config.featuredPost.id : config.featuredPost;
      if (pId) {
        const alreadyPopulated = blogs.find(b => String(b.id) === String(pId));
        if (!alreadyPopulated && !hydratedPosts[pId]) {
          missingIds.push(String(pId));
        }
      }
    }

    config.kbCategoryTabs.forEach((tab: any) => {
      const postsList = tab.blogPosts?.docs || (Array.isArray(tab.blogPosts) ? tab.blogPosts : []);

      postsList.forEach((postItem: any) => {
        const pId = typeof postItem === 'object' && postItem !== null ? postItem.id : postItem;
        if (pId) {
          const alreadyPopulated = blogs.find(b => String(b.id) === String(pId));
          if (!alreadyPopulated && !hydratedPosts[pId] && !missingIds.includes(String(pId))) {
            missingIds.push(String(pId));
          }
        }
      });
    });

    if (missingIds.length > 0) {
      // Use Payload's comma-separated syntax for 'in' operator to avoid query parameter parsing issues
      const now = new Date().toISOString()
      const idsQuery = `where[id][in]=${missingIds.join(',')}&where[status][equals]=published&where[publishedAt][less_than_equal]=${encodeURIComponent(now)}`;
      fetch(`/api/payload/blogs?locale=${locale}&${idsQuery}&depth=1&t=${Date.now()}`)
        .then(res => res.ok ? res.json() : { docs: [] })
        .then(data => {
          if (data?.docs?.length > 0) {
            setHydratedPosts(prev => {
              const next = { ...prev };
              data.docs.forEach((doc: any) => { next[doc.id] = doc; next[String(doc.id)] = doc; });
              return next;
            });
          }
        })
        .catch(err => console.error("Error hydrating missing cover images:", err));
    }
  }, [config, blogs, locale]);

  // Hydrate missing authors/avatars
  useEffect(() => {
    const missingAuthorIds = new Set<string>();

    const checkAuthor = (p: any) => {
      if (p?.author) {
        if (typeof p.author === 'number' || typeof p.author === 'string') {
          missingAuthorIds.add(String(p.author));
        } else if (typeof p.author === 'object' && p.author.id && (typeof p.author.avatar === 'number' || typeof p.author.avatar === 'string')) {
          missingAuthorIds.add(String(p.author.id));
        }
      }
    };

    blogs.forEach(checkAuthor);
    Object.values(hydratedPosts).forEach(checkAuthor);
    if (config?.featuredPost) checkAuthor(config.featuredPost);

    if (config?.sectionsData) {
      let rawSections = config.sectionsData[locale] || config.sectionsData["en"] || [];
      if (Array.isArray(config.sectionsData)) rawSections = config.sectionsData;
      (rawSections as any[]).forEach((s: any) => {
        if (s?.items) s.items.forEach(checkAuthor);
      });
    }

    const toFetch = Array.from(missingAuthorIds).filter(id => !hydratedAuthors[id]);

    if (toFetch.length > 0) {
      fetch(`/api/payload/authors?locale=${locale}&where[id][in]=${toFetch.join(',')}&depth=1`)
        .then(res => res.ok ? res.json() : { docs: [] })
        .then(data => {
          if (data?.docs?.length > 0) {
            setHydratedAuthors(prev => {
              const next = { ...prev };
              data.docs.forEach((doc: any) => { next[doc.id] = doc; next[String(doc.id)] = doc; });
              return next;
            });
          }
        })
        .catch(err => console.error("Error hydrating authors:", err));
    }
  }, [blogs, hydratedPosts, config, locale]);

  // Helper: a blog is only visible once current time >= publishedAt
  const isBlogVisible = (post: any) => {
    if (!post || !post.publishedAt) return false
    return new Date(post.publishedAt).getTime() <= Date.now()
  }

  // Create a flattened articles pool from categories for tag-based filtering
  // All sources are filtered so future-dated blogs never surface on the frontend.
  const articlePool = useMemo(() => {
    const allPosts: any[] = [...blogs].filter(isBlogVisible);
    const seenIds = new Set(allPosts.map(b => String(b.id)));

    // Add hydrated posts
    Object.values(hydratedPosts)
      .filter(isBlogVisible)
      .forEach((post: any) => {
        if (post && post.id && !seenIds.has(String(post.id))) {
          allPosts.push(post);
          seenIds.add(String(post.id));
        }
      });

    if (config?.kbCategoryTabs) {
      config.kbCategoryTabs.forEach((tab: any) => {
        const posts = tab.blogPosts?.docs || tab.blogPosts || [];
        if (Array.isArray(posts)) {
          posts.forEach((post: any) => {
            const pId = typeof post === 'object' && post !== null ? post.id : post;
            const fullPost = typeof post === 'object' && post !== null ? post : hydratedPosts[pId];

            if (fullPost && fullPost.id && isBlogVisible(fullPost) && !seenIds.has(String(fullPost.id))) {
              allPosts.push(fullPost);
              seenIds.add(String(fullPost.id));
            }
          });
        }
      });
    }
    return allPosts;
  }, [config?.kbCategoryTabs, blogs, hydratedPosts]);

  // Process sections and inject items based on tags
  const processedSections = useMemo(() => {
    if (!config?.sectionsData) return [];

    // Build a global author dictionary to fix Payload's reference deduplication
    // (Payload only populates the first occurrence of a related document)
    const authorMap: Record<string, any> = {};
    
    // add from hydratedAuthors first so they take precedence!
    Object.values(hydratedAuthors).forEach(a => {
      if (a && a.id) authorMap[a.id] = a;
    });

    // Only save authors that have their avatar populated as an object!
    const addAuthor = (p: any) => {
      if (p?.author && typeof p.author === 'object' && p.author.id) {
        if (!authorMap[p.author.id] || typeof p.author.avatar === 'object') {
          authorMap[p.author.id] = p.author;
        }
      }
    };

    articlePool.forEach(addAuthor);

    let rawSections =
      config.sectionsData[locale] || config.sectionsData["en"] || [];
    if (Array.isArray(config.sectionsData)) rawSections = config.sectionsData;

    (rawSections as any[]).forEach((s: any) => {
      if (s?.items) {
        s.items.forEach(addAuthor);
      }
    });

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

        // Re-hydrate authors to fix deduplication missing avatars
        items = items.map((p: any) => {
          if (p && p.author) {
            const aId = typeof p.author === 'object' ? p.author.id : p.author;
            if (authorMap[aId]) {
              return { ...p, author: authorMap[aId] };
            }
          }
          return p;
        });

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

  const heroPostId = config?.featuredPost ? (typeof config?.featuredPost === 'object' ? config.featuredPost.id : config.featuredPost) : null;
  const rawHeroPost = heroPostId ? (hydratedPosts[heroPostId] || articlePool.find((p: any) => String(p.id) === String(heroPostId)) || (typeof config.featuredPost === 'object' ? config.featuredPost : null)) : (blogs.length > 0 ? blogs[0] : null);

  // Hydrate hero author avatar so the left card shows the profile picture
  const heroPostObj = useMemo(() => {
    if (!rawHeroPost?.author) return rawHeroPost;

    const authorId = typeof rawHeroPost.author === 'object' ? rawHeroPost.author.id : rawHeroPost.author;
    const hydratedAuthor = hydratedAuthors[authorId];

    if (!hydratedAuthor) return rawHeroPost;

    return {
      ...rawHeroPost,
      author: {
        ...(typeof rawHeroPost.author === 'object' ? rawHeroPost.author : {}),
        ...hydratedAuthor,
      },
    };
  }, [rawHeroPost, hydratedAuthors]);

  const hero = {
    tag: config?.heroTitle || (locale === "zh" ? "本周推荐" : "FEATURED"),
    post: heroPostObj,
    backgroundImage: config?.heroBackgroundImage,
  };

  const categoryTabs = config?.kbCategoryTabs || [];

  return (
    <div
      className="min-h-screen bg-[#F6F4ED] font-lexend-deca antialiased selection:bg-[#ff4848] selection:text-white"
      data-header-theme="light"
    >
      <h1 className="sr-only">{pageTitle || "Busrom Knowledge Base & Blog"}</h1>
      
      {/* 1. HERO BANNER - SPLIT LAYOUT */}
      <HeroBanner hero={hero} locale={locale} />

      {/* 2. POPULAR TOPICS - RESTORED PREMIUM HOVER EFFECT */}
      <PopularTopics
        config={config}
        locale={locale}
        allLabel={allLabel}
        blogs={blogs}
        categoryTabs={categoryTabs}
        hydratedPosts={hydratedPosts}
      />

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
