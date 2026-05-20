"use client";

import React, { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ProductOverviewData } from "@/types/product-overview";
import useEmblaCarousel from "embla-carousel-react";

interface ExclusiveSolutionsSectionProps {
  data: ProductOverviewData["exclusiveSolutions"];
}

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

const NavButton = ({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative outline-none transition-all duration-300 transform active:scale-95"
      style={{ width: vw(115), height: vw(61) }}
    >
      {/* SVG 保持不变 */}
      <AnimatePresence mode="wait">
        {!isHovered ? (
          <motion.svg key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} width="100%" height="100%" viewBox="0 0 115 61" fill="none">
            <path d={direction === "prev" ? "M36.7383 28.2695H94V32.7559H36.7383V37.2422L21.2627 30.5127L36.7383 23.7832V28.2695Z" : "M78.2617 28.2695H21V32.7559H78.2617V37.2422L93.7373 30.5127L78.2617 23.7832V28.2695Z"} fill="white" />
            <rect x="1" y="1" width="113" height="59" rx="29.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />
          </motion.svg>
        ) : (
          <motion.svg key="hover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} width="100%" height="100%" viewBox="0 0 113 58" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d={direction === "next" ? "M84 0C100.016 0 113 12.9837 113 29C113 45.0163 100.016 58 84 58H29C12.9837 58 0 45.0163 0 29C0 12.9837 12.9837 0 29 0H84ZM78.3271 27.2803H24V31.7676H78.3271V36.2539L93.0098 29.5244L78.3271 22.7949V27.2803Z" : "M29 0C12.9837 0 0 12.9837 0 29C0 45.0163 12.9837 58 29 58H84C100.016 58 113 45.0163 113 29C113 12.9837 100.016 0 84 0H29ZM34.6729 27.2803H89V31.7676H34.6729V36.2539L19.9902 29.5244L34.6729 22.7949V27.2803Z"} fill="white" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
};

export function ExclusiveSolutionsSection({ data }: ExclusiveSolutionsSectionProps) {
  const [isAppleOS, setIsAppleOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
      setIsAppleOS(true);
    }
  }, []);

  // 多行大段落的偏移微调（保持您之前的设定）
  const fontOffset = isAppleOS ? 'translateY(0.12em)' : 'translateY(0)';

  // ================= 核心安全修复 =================
  // 专门给由于上下边距导致 Mac 极度偏上的 Logo 徽章一个更猛的偏移量
  // 0.25em 相当于往下推了 1/4 的字号高度，您可以微调这个值
  const badgeFontOffset = isAppleOS ? 'translateY(0.25em)' : 'translateY(0)';
  // ================================================

  const [desktopRef, desktopApi] = useEmblaCarousel({ loop: true, align: "start", skipSnaps: false });
  const [mobileRef, mobileApi] = useEmblaCarousel({ loop: true, align: "start", skipSnaps: false });

  const scrollPrevDesktop = useCallback(() => desktopApi && desktopApi.scrollPrev(), [desktopApi]);
  const scrollNextDesktop = useCallback(() => desktopApi && desktopApi.scrollNext(), [desktopApi]);
  const scrollPrevMobile = useCallback(() => mobileApi && mobileApi.scrollPrev(), [mobileApi]);
  const scrollNextMobile = useCallback(() => mobileApi && mobileApi.scrollNext(), [mobileApi]);

  if (!data || !data.items || data.items.length === 0) return null;

  const { logoText, title, subtitle, content, items } = data;

  const renderRichText = (node: any): React.ReactNode => {
    if (typeof node === "string") return node;
    if (!node) return null;
    if (node.root) return renderRichText(node.root);
    if (node.children) return node.children.map((child: any, idx: number) => <React.Fragment key={idx}>{renderRichText(child)}</React.Fragment>);
    if (node.type === "linebreak") return <br />;
    if (node.type === "text") {
      if ((node.format & 16) === 16) return null;
      const isBold = (node.format & 1) === 1;
      return <span style={{ color: isBold ? "#756F3F" : "inherit", fontWeight: isBold ? "bold" : "normal" }}>{node.text}</span>;
    }
    return null;
  };

  return (
    <section className="relative w-full overflow-hidden" id="exclusive-solutions">
      {/* ==================== 1. Desktop Layout ==================== */}
      <div className="hidden md:block w-full" style={{ paddingTop: vw(125), paddingBottom: vw(125), background: "linear-gradient(180deg, #fff6d4 0%, #fff6d4 70%, #f6f4ed 100%)", borderRadius: vw(80) }}>
        <div className="mx-auto" style={{ width: vw(1524) }}>
          <div className="relative" style={{ marginBottom: vw(76) }}>
            <div className="flex">
              {/* 恢复为您在 Windows 上完美生效的布局容器，完全不改 physical 尺寸 */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.5 }, x: { duration: 0.5 } }}
                className="font-katibeh flex items-center justify-center bg-[#ffe484] text-black rounded-full relative"
                style={{
                  fontSize: vw(36),
                  paddingLeft: `${vw(60)}`,
                  paddingRight: `${vw(60)}`,
                  paddingTop: `${isAppleOS ? vw(8) : vw(2)}`,    // 锁定 Windows 的完美数据
                  paddingBottom: `${vw(10)}`, // 锁定 Windows 的完美数据
                  lineHeight: 1,
                  marginBottom: isAppleOS ? vw(38) : vw(10),
                }}
              >
                {/* 仅在内部使用隔离的 translateY 把 Mac 的字压下去，不影响任何外层排版 */}
                <span style={{ display: 'inline-block', transform: badgeFontOffset }}>
                  {logoText}
                </span>
              </motion.p>
            </div>

            <div className="flex justify-between items-start" style={{ gap: vw(40) }}>
              {/* Left Column */}
              <div className="flex flex-col" style={{ width: vw(804) }}>
                <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="font-katibeh text-black" style={{ fontSize: vw(96), lineHeight: 1, marginTop: 0 }}>
                  <span style={{ display: 'block', transform: fontOffset }}>{renderRichText(title)}</span>
                </motion.h2>

                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="font-katibeh text-black whitespace-pre-line" style={{ fontSize: vw(32), lineHeight: 1.15, marginTop: vw(24) }}>
                  <span style={{ display: 'block', transform: fontOffset }}>{renderRichText(subtitle)}</span>
                </motion.p>
              </div>

              {/* Right Column */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative bg-[#FFBB3220] backdrop-blur-sm self-start flex items-center flex-shrink-0" style={{ width: vw(680), padding: `${vw(28)} ${vw(38)}`, borderRadius: vw(35), marginTop: 0 }}>
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full"><rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx={vw(35)} ry={vw(35)} fill="none" stroke="#E9D89E" strokeWidth="2" strokeDasharray="8 8" strokeLinecap="round" /></svg>
                </div>
                <p className="font-katibeh text-[#965200] whitespace-pre-line relative z-10 w-full" style={{ fontSize: vw(38), lineHeight: 1.15 }}>
                  <span style={{ display: 'block', transform: fontOffset }}>{renderRichText(content)}</span>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Carousel Box 保持不变 */}
          <div className="relative overflow-hidden w-full" style={{ height: vw(850), background: "linear-gradient(180deg, #464010 0%, rgba(172, 157, 39, 0.55) 100%)", borderRadius: vw(60) }}>
            <div className="absolute inset-x-0 top-0 z-30 flex justify-between items-center pointer-events-none" style={{ padding: `${vw(60)} ${vw(40)}` }}>
              <div className="pointer-events-auto"><NavButton direction="prev" onClick={scrollPrevDesktop} /></div>
              <div className="pointer-events-auto"><NavButton direction="next" onClick={scrollNextDesktop} /></div>
            </div>

            <div className="overflow-hidden h-full" ref={desktopRef}>
              <div className="flex h-full">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex-shrink-0 w-full h-full flex items-end" style={{ padding: `${vw(157)} ${vw(60)} ${vw(58)} ${vw(60)}` }}>
                    <div className="flex w-full h-full items-end" style={{ gap: vw(20) }}>
                      <div className="flex flex-col justify-between h-full shrink-0" style={{ width: "auto" }}>
                        <div className="bg-[#5a5319] flex items-center shadow-lg" style={{ borderRadius: vw(60), padding: vw(38), width: "fit-content", maxWidth: vw(550) }}>
                          <p className="font-josefin-sans text-white opacity-90 whitespace-pre-line" style={{ fontSize: vw(32), lineHeight: 1.4 }}>{item.description}</p>
                        </div>
                        <h3 className="font-josefin-sans font-bold text-white uppercase tracking-tight whitespace-pre-line" style={{ fontSize: vw(40), lineHeight: 1.4 }}>{item.title}</h3>
                      </div>

                      <div className="flex flex-1 h-full justify-end" style={{ gap: vw(20) }}>
                        <div className="overflow-hidden shadow-xl shrink-0" style={{ width: vw(425), height: "100%", borderRadius: vw(60) }}>
                          {item.leftImage && <OptimizedImage image={item.leftImage} alt="Solution Detail" className="w-full h-full object-cover" size="large" />}
                        </div>
                        <div className="overflow-hidden shadow-xl shrink-0" style={{ width: vw(425), height: "100%", borderRadius: vw(60) }}>
                          {item.rightImage && <OptimizedImage image={item.rightImage} alt="Application Case" className="w-full h-full object-cover" size="large" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. Mobile Layout ==================== */}
      <div className="md:hidden w-full pt-16 pb-12 px-6 flex flex-col bg-[#fff6d4]">
        {/* Header Badge */}
        <div className="flex mb-4">
          <p
            className="font-katibeh flex items-center justify-center px-6 bg-[#ffe484] text-black text-xl rounded-full"
            style={{
              lineHeight: 1.2,
              paddingTop: '2px',    // 移动端也恢复物理写死
              paddingBottom: '10px' // 移动端也恢复物理写死
            }}
          >
            {/* 使用大剂量的偏移量让 Mac 乖乖听话 */}
            <span style={{ display: 'inline-block', transform: badgeFontOffset }}>
              {logoText}
            </span>
          </p>
        </div>

        {/* Title & Subtitle Stack */}
        <div className="flex flex-col mb-4">
          <h2 className="font-katibeh text-4xl text-black leading-tight mb-2">
            <span style={{ display: 'block', transform: fontOffset }}>{renderRichText(title)}</span>
          </h2>
          <p className="font-katibeh text-lg text-black/80 leading-snug">
            <span style={{ display: 'block', transform: fontOffset }}>{renderRichText(subtitle)}</span>
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-[#FFBB3220] border-2 border-dashed border-[#E9D89E] rounded-[24px] px-4 py-3 mb-8">
          <p className="font-katibeh text-[#965200] text-lg leading-normal text-center sm:text-left">
            <span style={{ display: 'block', transform: fontOffset }}>{renderRichText(content)}</span>
          </p>
        </div>

        {/* Carousel Container 保持不变 */}
        <div className="relative w-full rounded-[30px] overflow-hidden" style={{ background: "linear-gradient(180deg, #464010 0%, rgba(172, 157, 39, 0.55) 100%)", padding: "24px 12px" }}>
          <div className="flex justify-between items-center mb-5 px-2">
            <button onClick={scrollPrevMobile} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/30 bg-white/5 active:bg-white/20 transition-colors" aria-label="Previous slide"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <button onClick={scrollNextMobile} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/30 bg-white/5 active:bg-white/20 transition-colors" aria-label="Next slide"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </div>

          <div className="overflow-hidden" ref={mobileRef}>
            <div className="flex">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex-shrink-0 w-full flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-[4/5] rounded-[20px] overflow-hidden shadow-lg">
                      {item.leftImage && <OptimizedImage image={item.leftImage} alt="Detail 1" size="large" className="w-full h-full object-cover" />}
                    </div>
                    <div className="aspect-[4/5] rounded-[20px] overflow-hidden shadow-lg">
                      {item.rightImage && <OptimizedImage image={item.rightImage} alt="Detail 2" size="large" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-josefin-sans font-bold text-white text-xl uppercase leading-tight">{item.title}</h3>
                    <div className="bg-white/10 backdrop-blur-sm rounded-[18px] p-4">
                      <p className="font-josefin-sans text-white/90 text-[13px] leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}