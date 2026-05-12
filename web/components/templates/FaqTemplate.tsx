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
  const detailRef = React.useRef<HTMLDivElement>(null);
  const contactRef = React.useRef<HTMLDivElement>(null);

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

  // Global Hash Listener to sync Active Category
  React.useEffect(() => {
    const syncHashWithState = () => {
      const hash = window.location.hash;
      console.log("[FaqTemplate] Hash Change Detected:", hash);

      if (hash.startsWith("#faq-") && detail?.items) {
        const slug = hash.replace("#faq-", "");
        console.log("[FaqTemplate] Searching for slug in hash:", slug);

        const items = detail.items;
        const matchIndex = items.findIndex((item: any) => {
          // Generate a slug from title since the 'slug' field is missing after parsing
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
        <FaqSearchSection
          data={search}
          locale={locale}
          detailData={detail}
          onSearchSelect={handleSearchSelect}
        />
      )}

      {/* Guide Section */}
      {guide && (
        <FaqGuideSection
          data={guide}
          locale={locale}
          onNavigate={handleNavigate}
        />
      )}

      {/* Popular Section */}
      {popular && <FaqPopularSection data={popular} locale={locale} />}

      {/* Detail Section */}
      {detail && (
        <div ref={detailRef}>
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
        <div ref={contactRef}>
          <FaqContactSection data={contact} locale={locale} />
        </div>
      )}

      {/* Quote Section */}
      {quote && <FaqQuoteSection data={quote} locale={locale} />}
    </main>
  );
}
