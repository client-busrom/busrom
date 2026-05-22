"use client";

import React from "react";
import { RichText, defaultJSXConverters } from "@payloadcms/richtext-lexical/react";

interface PrivacyPolicyTemplateProps {
  data: any;
  locale: string;
}

/**
 * Specialized template for Privacy Policy
 * Isolates premium typography and layout requirements
 */
export function PrivacyPolicyTemplate({ data, locale }: PrivacyPolicyTemplateProps) {
  const content = data.content || data.contentTranslation;

  if (!content) return null;

  // Localized converters to avoid affecting global LexicalRenderer
  const privacyConverters: any = {
    ...defaultJSXConverters,
    heading: ({ node, nodesToJSX }: any) => {
      const Tag = (node.tag?.toLowerCase() || "h2") as any;
      const textContent = node.children?.map((c: any) => c.text).join("") || "";
      const id = textContent
        ? textContent
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
        : undefined;

      const isH1 = Tag === "h1";
      const alignment = node.format || (isH1 ? "center" : "");
      const alignmentClass = alignment ? `text-${alignment}` : "";

      const headingContent = (
        <Tag
          id={id}
          className={`${
            isH1
              ? "text-[43.2px] text-white font-normal text-balance leading-tight capitalize relative z-10 mix-blend-difference mb-10 mt-0"
              : Tag === "h2"
                ? "text-2xl mt-10 mb-5"
                : "text-xl mt-5 mb-5"
          } heading ${alignmentClass} font-montserrat font-extrabold text-[#000000] !leading-[1.4] block`}
        >
          {isH1 && <span className="inline-block bg-white w-6 md:w-10 h-px align-middle mr-4 md:mr-6"></span>}
          {nodesToJSX({ nodes: node.children })}
          {isH1 && <span className="inline-block bg-white w-6 md:w-10 h-px align-middle ml-4 md:ml-6"></span>}
        </Tag>
      );

      if (id) {
        return (
          <a href={`#${id}`} className="no-underline">
            {headingContent}
          </a>
        );
      }

      return headingContent;
    },
    horizontalrule: () => {
      // Full-width horizontal line matching reference
      return <hr className="my-16 border-t border-gray-200 w-screen relative left-1/2 -translate-x-1/2" />;
    },
    paragraph: ({ node, nodesToJSX }: any) => {
      const alignment = node.format ? `text-${node.format}` : "";
      const isEmpty = !node.children || node.children.length === 0;

      return (
        <p 
          className={`leading-[1.8] text-[#000000] text-justify text-[16px] ${alignment} my-5 ${
            isEmpty ? 'min-h-[1.5em]' : ''
          }`}
        >
          {isEmpty ? '\u00A0' : nodesToJSX({ nodes: node.children })}
        </p>
      );
    },
    list: ({ node, nodesToJSX }: any) => {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return (
        <Tag
          className={`my-5 ml-6 ${node.listType === "number" ? "list-decimal" : "list-disc"} space-y-2 text-[#000000]`}
        >
          {nodesToJSX({ nodes: node.children })}
        </Tag>
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f4ed] pt-20 font-montserrat" data-header-theme="light">
      <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
        <div className="max-w-5xl mx-auto">
          <RichText data={content} converters={privacyConverters} />
        </div>
      </div>
    </main>
  );
}
