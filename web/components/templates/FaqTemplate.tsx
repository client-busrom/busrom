"use client"

import React from "react"
import { FaqHeroSection } from "@/components/faq/sections/FaqHeroSection"
import { FaqSearchSection } from "@/components/faq/sections/FaqSearchSection"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import type { FaqData } from "@/lib/parsers/faq-parser"

interface FaqTemplateProps {
  locale: string
  data: FaqData
}

export function FaqTemplate({ locale, data }: FaqTemplateProps) {
  const {
    hero,
    search,
    guide,
    popular,
    detail,
    contact,
    quote,
  } = data

  return (
    <main className="min-h-screen bg-[#FBF9F1]" data-header-theme="dark">
      {/* Hero Section */}
      {hero && <FaqHeroSection data={hero} locale={locale} />}

      {/* Search Section */}
      {search && <FaqSearchSection data={search} locale={locale} />}

      {/* Guide Section */}
      {guide && (
        <section className="py-24 bg-[#F3F4F6]" id="guide-section">
           <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                 {guide.title && <LexicalRenderer content={{ root: { children: guide.title } }} />}
              </div>
           </div>
        </section>
      )}

      {/* Popular Section */}
      {popular && (
        <section className="py-24" id="popular-section">
           <div className="container mx-auto px-6">
              {popular.title && <LexicalRenderer content={{ root: { children: popular.title } }} />}
           </div>
        </section>
      )}

      {/* Detail Section */}
      {detail && (
        <section className="py-24 bg-[#FBF9F1]" id="detail-section">
           {/* FAQ Accordions logic goes here */}
        </section>
      )}

      {/* Contact Section */}
      {contact && (
        <section className="py-24" id="contact-section">
           {contact.title && <LexicalRenderer content={{ root: { children: contact.title } }} />}
        </section>
      )}

      {/* Quote Section */}
      {quote && (
        <section className="py-24 bg-black text-white" id="quote-section">
           {quote.title && <LexicalRenderer content={{ root: { children: quote.title } }} />}
        </section>
      )}
    </main>
  )
}
