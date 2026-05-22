"use client";

import React from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { defaultJSXConverters } from "@payloadcms/richtext-lexical/react";
import type { FraudNoticeData } from "@/lib/parsers/fraud-notice-parser";
import { FraudHero } from "@/components/fraud/FraudHero";
import { FraudNoticeContent } from "@/components/fraud/FraudNoticeContent";
import { FraudContactFormSection } from "../fraud/FraudContactFormSection";
import { FraudQuoteGuide } from "@/components/fraud/FraudQuoteGuide";

interface FraudNoticeTemplateProps {
  locale: string;
  data: FraudNoticeData;
}

export function FraudNoticeTemplate({ locale, data }: FraudNoticeTemplateProps) {
  const { hero, content, contactForm, quoteGuide } = data;

  const fraudConverters: any = {
    ...defaultJSXConverters,
    heading: ({ node, nodesToJSX }: any) => {
      const Tag = (node.tag?.toLowerCase() || "h2") as any;
      const isH1 = Tag === "h1";
      return (
        <Tag className={`${
          isH1 ? "text-4xl md:text-6xl font-black mb-10" : "text-2xl md:text-3xl font-bold mt-10 mb-6"
        } text-[#060C14] leading-tight`}>
          {nodesToJSX({ nodes: node.children })}
        </Tag>
      );
    },
    horizontalrule: () => (
      <hr className="my-16 border-t border-gray-200" />
    ),
    paragraph: ({ node, nodesToJSX }: any) => {
      const isEmpty = !node.children || node.children.length === 0;
      const isMarker = node.children?.some((c: any) => c.mode === 'normal' && (c.text === 'hero-section-title' || c.text === 'hero-section-description' || c.text === 'notice-content-block-title' || c.text === 'contact-form-title' || c.text === 'contact-form-description'));
      
      if (isMarker) return null;

      return (
        <p className={`leading-relaxed text-gray-700 text-lg my-6 ${isEmpty ? 'min-h-[1em]' : ''}`}>
          {isEmpty ? '\u00A0' : nodesToJSX({ nodes: node.children })}
        </p>
      );
    },
    list: ({ node, nodesToJSX }: any) => {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return (
        <Tag className={`my-8 ml-6 ${node.listType === "number" ? "list-decimal" : "list-disc"} space-y-4 text-gray-700 text-lg`}>
          {nodesToJSX({ nodes: node.children })}
        </Tag>
      );
    },
    link: ({ node, nodesToJSX }: any) => {
      return (
        <a 
          href={node.fields?.url} 
          target={node.fields?.newTab ? "_blank" : "_self"}
          className="text-[#060C14] font-bold underline underline-offset-4 hover:text-gray-600 transition-colors"
        >
          {nodesToJSX({ nodes: node.children })}
        </a>
      );
    },
    blocks: {
      twoColumns: () => null,
      formBlock: () => null,
      carousel: () => null,
      faqSelection: () => null,
      productCarousel: () => null,
      applicationCarousel: () => null,
    },
    singleImage: () => null,
    quote: () => null,
  };

  return (
    <main className="min-h-screen bg-[#f6f4ed] font-montserrat" data-header-theme="light">
      {/* 1. Hero Section */}
      <FraudHero hero={hero} fraudConverters={fraudConverters} />

      {/* 2. Notice Content */}
      <FraudNoticeContent content={content} fraudConverters={fraudConverters} />

      {/* 3. Contact Form Section */}
      {contactForm?.formConfig && (
        <FraudContactFormSection  
          locale={locale} 
          bgImage={contactForm.bgImage}
          displayImage={contactForm.displayImage}
          richText={contactForm.richText}
          formId={contactForm.formId}
          formConfig={contactForm.formConfig}
        />
      )}

      {/* 4. Quote Guide / Accordion */}
      <FraudQuoteGuide quoteGuide={quoteGuide} locale={locale} />
    </main>
  );
}
