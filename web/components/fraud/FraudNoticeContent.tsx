"use client";

import React, { useLayoutEffect, useRef } from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FraudNoticeContentProps {
  content: any;
  fraudConverters: any;
}

export function FraudNoticeContent({
  content,
  fraudConverters,
}: FraudNoticeContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!content.block || !containerRef.current || !stickyRef.current) return;

    let ctx = gsap.context(() => {
      // 获取标题相对于容器顶部的初始偏移量 (通常是 40px 左右)
      const initialOffset = stickyRef.current?.offsetTop || 0;
      // 目标：标题在视口 102px 处开始吸附
      // 公式：容器顶部位置 = 102px - 初始偏移
      const triggerStart = 102 - initialOffset;

      ScrollTrigger.create({
        // 使用父容器作为触发器更稳定
        trigger: containerRef.current,
        start: `top ${triggerStart}px`,
        // 结束参照
        endTrigger: containerRef.current,
        // 精确对齐底部：当容器底部到达 (Pin位置 102px + 标题真实高度) 时停止
        end: () => `bottom ${102 + (stickyRef.current?.offsetHeight || 0)}px`,
        pin: stickyRef.current,
        pinSpacing: false,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        refreshPriority: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [content]);

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
              ref={containerRef}
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
              <div className="relative">
                <div ref={stickyRef} className="z-10 w-full">
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
