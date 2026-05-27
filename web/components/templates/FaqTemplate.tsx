"use client";

import React from "react";
import { FaqHeroSection } from "@/components/faq/sections/FaqHeroSection";
import { FaqSearchSection } from "@/components/faq/sections/FaqSearchSection";
import { FaqGuideSection } from "@/components/faq/sections/FaqGuideSection";
import { FaqPopularSection } from "@/components/faq/sections/FaqPopularSection";
import { FaqDetailSection } from "@/components/faq/sections/FaqDetailSection";
import { FaqContactSection } from "@/components/faq/sections/FaqContactSection";
import { FaqQuoteSection } from "@/components/faq/sections/FaqQuoteSection";
import type { FaqData } from "@/lib/parsers/faq-parser";

interface FaqTemplateProps {
  locale: string;
  data: FaqData;
}

export function FaqTemplate({ locale, data }: FaqTemplateProps) {
  const { hero, search, guide, popular, detail, contact, quote } = data;
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(
    null,
  );
  const [activeFaqId, setActiveFaqId] = React.useState<string | null>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const guideRef = React.useRef<HTMLDivElement>(null);
  const popularRef = React.useRef<HTMLDivElement>(null);
  const detailRef = React.useRef<HTMLDivElement>(null);
  const contactRef = React.useRef<HTMLDivElement>(null);
  const quoteRef = React.useRef<HTMLDivElement>(null);

  // Map section names to their refs for scroll navigation
  const sectionRefs = React.useMemo(() => ({
    search: searchRef,
    guide: guideRef,
    popular: popularRef,
    detail: detailRef,
    contact: contactRef,
    quote: quoteRef,
  }), []);

  const scrollToSection = (sectionName: string) => {
    const ref = sectionRefs[sectionName as keyof typeof sectionRefs];
    ref?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavigate = (type: "category" | "contact", idOrSlug?: string) => {
    if (type === "category" && idOrSlug) {
      const items = detail?.items || [];
      const matchIndex = items.findIndex((item: any) => {
        const titleSlug = (item.title || "")
          .toLowerCase()
          .trim()
          .replace(/[&\s]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/[^\w-]/g, "");

        const cid = (item.id || item.category?.id) + "";
        return titleSlug === idOrSlug || cid === idOrSlug;
      });

      if (matchIndex !== -1) {
        const match = items[matchIndex];
        const targetId = match.id || `cat-${matchIndex}`;
        setActiveCategoryId(targetId);
        detailRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        // Fallback for direct ID matches
        setActiveCategoryId(idOrSlug);
        detailRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (type === "contact") {
      contactRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearchSelect = (categoryId: string, faqId: string) => {
    setActiveCategoryId(categoryId);
    setActiveFaqId(faqId);
    // 给一点时间让分类切换完成，然后滚动
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Global Hash Listener to handle all FAQ page section navigation
  React.useEffect(() => {
    const syncHashWithState = () => {
      const hash = window.location.hash;
      if (!hash.startsWith("#faq-")) return;

      const slug = hash.replace("#faq-", "");

      // 1. Section-only navigation: #faq-search, #faq-guide, #faq-popular, #faq-contact, #faq-quote
      const sectionNames = ["search", "guide", "popular", "contact", "quote"];
      if (sectionNames.includes(slug)) {
        scrollToSection(slug);
        return;
      }

      // 2. Detail section with category: #faq-detail-<category-slug>
      if (slug.startsWith("detail-") && detail?.items) {
        const categorySlug = slug.replace("detail-", "");
        const items = detail.items;
        const matchIndex = items.findIndex((item: any) => {
          const titleSlug = (item.title || "")
            .toLowerCase()
            .replace(/ & /g, "-")
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

          const cid = (item.id || item.category?.id) + "";
          return titleSlug === categorySlug || cid === categorySlug;
        });

        if (matchIndex !== -1) {
          const match = items[matchIndex];
          const targetId = match.id || `cat-${matchIndex}`;
          if (targetId !== activeCategoryId) {
            setActiveCategoryId(targetId);
          }
          // Scroll to detail section after state update
          setTimeout(() => {
            detailRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }
        return;
      }

      // 3. Legacy: #faq-<category-slug> (direct category match in detail section)
      if (detail?.items) {
        const items = detail.items;
        const matchIndex = items.findIndex((item: any) => {
          const titleSlug = (item.title || "")
            .toLowerCase()
            .replace(/ & /g, "-")
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

          const cid = (item.id || item.category?.id) + "";
          return titleSlug === slug || cid === slug;
        });

        if (matchIndex !== -1) {
          const match = items[matchIndex];
          const targetId = match.id || `cat-${matchIndex}`;
          if (targetId !== activeCategoryId) {
            setActiveCategoryId(targetId);
          }
        }
      }
    };

    syncHashWithState();
    window.addEventListener("hashchange", syncHashWithState);
    return () => window.removeEventListener("hashchange", syncHashWithState);
  }, [detail?.items, activeCategoryId]);

  return (
    <main className="min-h-screen bg-[#F6F4ED]" data-header-theme="dark">
      {/* Hero Section */}
      {hero && <FaqHeroSection data={hero} locale={locale} />}

      {/* Search Section */}
      {search && (
        <div ref={searchRef} id="faq-search">
          <FaqSearchSection
            data={search}
            locale={locale}
            detailData={detail}
            onSearchSelect={handleSearchSelect}
          />
        </div>
      )}

      {/* Guide Section */}
      {guide && (
        <div ref={guideRef} id="faq-guide">
          <FaqGuideSection
            data={guide}
            locale={locale}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      {/* Popular Section */}
      {popular && (
        <div ref={popularRef} id="faq-popular">
          <FaqPopularSection data={popular} locale={locale} />
        </div>
      )}

      {/* Detail Section */}
      {detail && (
        <div ref={detailRef} id="faq-detail">
          <FaqDetailSection
            data={detail}
            locale={locale}
            activeId={activeCategoryId}
            setActiveId={setActiveCategoryId}
            activeFaqId={activeFaqId}
            setActiveFaqId={setActiveFaqId}
          />
        </div>
      )}

      {/* Contact Section */}
      {contact && (
        <div ref={contactRef} id="faq-contact">
          <FaqContactSection data={contact} locale={locale} />
        </div>
      )}

      {/* Quote Section */}
      {quote && (
        <div ref={quoteRef} id="faq-quote">
          <FaqQuoteSection data={quote} locale={locale} />
        </div>
      )}
    </main>
  );
}
