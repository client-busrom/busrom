"use client";

import React from "react";
import { FaqHeroSection } from "@/components/faq/sections/FaqHeroSection";
import { FaqSearchSection } from "@/components/faq/sections/FaqSearchSection";
import { FaqGuideSection } from "@/components/faq/sections/FaqGuideSection";
import { FaqPopularSection } from "@/components/faq/sections/FaqPopularSection";
import { FaqDetailSection } from "@/components/faq/sections/FaqDetailSection";
import { FaqContactSection } from "@/components/faq/sections/FaqContactSection";
import { FaqQuoteSection } from "@/components/faq/sections/FaqQuoteSection";
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";
import type { FaqData } from "@/lib/parsers/faq-parser";

interface FaqTemplateProps {
  locale: string;
  data: FaqData;
}

export function FaqTemplate({ locale, data }: FaqTemplateProps) {
  const { hero, search, guide, popular, detail, contact, quote } = data;
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(
    null
  );
  const detailRef = React.useRef<HTMLDivElement>(null);
  const contactRef = React.useRef<HTMLDivElement>(null);

  const handleNavigate = (type: "category" | "contact", id?: string) => {
    if (type === "category" && id) {
      setActiveCategoryId(id);
      detailRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (type === "contact") {
      contactRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F4ED]" data-header-theme="dark">
      {/* Hero Section */}
      {hero && <FaqHeroSection data={hero} locale={locale} />}

      {/* Search Section */}
      {search && <FaqSearchSection data={search} locale={locale} />}

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
