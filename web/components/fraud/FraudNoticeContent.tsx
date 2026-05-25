"use client";

import React from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";

interface FraudNoticeContentProps {
  content: any;
  fraudConverters: any;
}

export function FraudNoticeContent({
  content,
  fraudConverters,
}: FraudNoticeContentProps) {
  if (!content) return null;

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="prose-none mb-20">
            <RichText
              data={{ root: { children: content.text } } as any}
              converters={fraudConverters}
            />
          </div>

          {content.block && (
            <div
              className={`grid grid-cols-1 ${
                content.block.columnRatio === "1:2"
                  ? "md:grid-cols-[1fr_2fr]"
                  : content.block.columnRatio === "2:1"
                    ? "md:grid-cols-[2fr_1fr]"
                    : "md:grid-cols-2"
              } ${
                content.block.gap === "small"
                  ? "gap-8"
                  : content.block.gap === "large"
                    ? "gap-24"
                    : "gap-16"
              } items-start`}
            >
              <div className="sticky top-[102px] z-10 w-full self-start">
                <div className="font-montserrat font-black text-[#060C14] text-[32px] leading-tight m-0 p-0">
                  <RichText
                    data={{ root: { children: content.block.title } } as any}
                    converters={{
                      ...fraudConverters,
                      heading: ({ node, nodesToJSX }: any) => (
                        <h2 className="text-[32px] font-black text-[#060C14] leading-tight m-0">
                          {nodesToJSX({ nodes: node.children })}
                        </h2>
                      )
                    }}
                  />
                </div>
              </div>
              <div className="prose text-gray-600 leading-loose">
                <RichText
                  data={{ root: { children: content.block.text } } as any}
                  converters={{
                    ...fraudConverters,
                    paragraph: ({ nodesToJSX, node }: any) => (
                      <p className="m-0 mb-6 last:mb-0">
                        {nodesToJSX({ nodes: node.children })}
                      </p>
                    ),
                    text: ({ node }: any) => {
                      const isBold = node.format & 1; // Standard Lexical IS_BOLD
                      return (
                        <span
                          className={
                            isBold
                              ? "text-[28px] font-bold text-[#060C14]"
                              : "text-[18px] font-normal text-gray-600"
                          }
                        >
                          {node.text}
                        </span>
                      );
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
