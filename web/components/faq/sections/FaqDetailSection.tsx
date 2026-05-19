"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface FaqItem {
  id: string;
  question: string;
  answer: any;
  image?: any;
}

interface CategoryData {
  id: string;
  slug: string;
  title: string;
  artText: string;
  image: any;
  icon?: string;
  faqs: FaqItem[];
}

const FaqItemRow = React.memo(({ 
  faq, 
  fIdx, 
  isOpen, 
  toggleFaq, 
  vw 
}: { 
  faq: FaqItem; 
  fIdx: number; 
  isOpen: boolean; 
  toggleFaq: (id: string) => void;
  vw: (px: number) => string;
}) => {
  const numStr = (fIdx + 1).toString().padStart(2, "0") + ".";
  
  return (
    <div
      id={`faq-item-${faq.id}`}
      className="w-full border-t border-[#c7c3a5] last:border-b"
    >
      <div
        className="group cursor-pointer flex items-start relative"
        style={{
          paddingTop: vw(40),
          paddingBottom: isOpen ? vw(5) : vw(40),
        }}
        onClick={() => toggleFaq(faq.id)}
      >
        <span
          className="text-[#756f3f] font-medium leading-none"
          style={{
            fontSize: vw(36),
            fontFamily: "var(--font-anaheim), sans-serif",
            marginTop: vw(6),
            width: vw(60),
          }}
        >
          {numStr}
        </span>

        <h1
          className="text-black font-bold font-anaheim flex-1 leading-[1.2] m-0"
          style={{
            fontSize: vw(36),
            paddingRight: isOpen && faq.image ? vw(260) : vw(66),
          }}
        >
          {faq.question}
        </h1>

        <div
          className="absolute right-0 flex items-center justify-end"
          style={{ width: vw(240), top: isOpen ? vw(50) : vw(40) }}
        >
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="arrow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center rounded-full bg-[#ece6d0]"
                style={{
                  width: vw(60),
                  height: vw(60),
                }}
              >
                <svg width={vw(24)} height={vw(24)} viewBox="0 0 24 24" fill="none">
                  <path d="M9 5L16 12L9 19" stroke="#676767" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            ) : (
              faq.image && (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="overflow-hidden border border-white/10"
                  style={{ width: vw(236), height: vw(236), borderRadius: vw(20) }}
                >
                  <OptimizedImage image={faq.image} className="w-full h-full object-cover" />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex"
              style={{
                paddingTop: vw(10),
                paddingBottom: vw(10),
                paddingLeft: vw(62),
                paddingRight: vw(260),
              }}
            >
              <div
                className="flex-1 text-[#605b37] font-anaheim font-medium [&_p:first-child]:mt-0 [&_p]:leading-[inherit] [&_p]:tracking-[inherit]"
                style={{
                  fontSize: vw(22),
                  lineHeight: 1.4,
                  letterSpacing: "0.02em",
                }}
              >
                <LexicalRenderer content={faq.answer} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FaqItemRow.displayName = "FaqItemRow";

interface FaqDetailSectionProps {
  data: {
    items: any[];
    selection: any;
  };
  locale: string;
  activeId: string | null;
  setActiveId: (id: string) => void;
  activeFaqId?: string | null;
  setActiveFaqId?: (id: string | null) => void;
}

export function FaqDetailSection({
  data,
  locale,
  activeId,
  setActiveId,
  activeFaqId,
  setActiveFaqId,
}: FaqDetailSectionProps) {
  const categories: CategoryData[] = React.useMemo(() => {
    return (data.items || []).map((cat, idx) => {
      const generatedSlug = (cat.title || "")
        .toLowerCase()
        .trim()
        .replace(/[&\s]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/[^\w-]/g, "");

      return {
        id: cat.id || `cat-${idx}`,
        slug: generatedSlug,
        title: cat.title || "",
        artText: cat.artText || "",
        image: cat.image,
        faqs: cat.faqs || [],
        icon: cat.icon || "lucide:message-circle",
      };
    });
  }, [data.items]);

  React.useEffect(() => {
    if (!activeId && categories.length > 0) {
      setActiveId(categories[0].id);
    }
  }, [activeId, categories, setActiveId]);

  const activeIndex = categories.findIndex((c) => c.id === activeId);
  const activeCategory = categories[activeIndex === -1 ? 0 : activeIndex];

  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: scrollRef,
  });
  const scrollBarTop = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);

  // 处理搜索结果的跳转和展开
  React.useEffect(() => {
    if (activeFaqId && activeCategory) {
      // 1. 展开该问题
      setOpenFaqs((prev) => ({ ...prev, [activeFaqId]: true }));

      // 2. 内部滚动定位
      setTimeout(() => {
        const element = 
          document.getElementById(`faq-item-${activeFaqId}`) || 
          document.getElementById(`faq-item-mobile-${activeFaqId}`);
        if (element) {
          if (scrollRef.current && window.innerWidth >= 1024) {
            const container = scrollRef.current;
            const elementTop = element.offsetTop;
            container.scrollTo({
              top: elementTop - 20, // 稍微留一点间距
              behavior: "smooth",
            });
          } else {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
        // 完成后清空状态，避免重复触发
        setActiveFaqId?.(null);
      }, 300); // 等待分类切换和渲染完成
    }
  }, [activeFaqId, activeCategory, setActiveFaqId]);

  // Remove handleScroll to prevent re-renders

  const handleScrollbarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = e.currentTarget;
    const container = scrollRef.current;
    if (!container) return;

    const scroll = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      const clickY = clientY - rect.top;
      const ratio = Math.max(0, Math.min(1, clickY / rect.height));
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = ratio * maxScroll;
    };

    scroll(e.clientY);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      scroll(moveEvent.clientY);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const constraintsRef = React.useRef<HTMLDivElement>(null);

  if (!activeCategory) return null;

  return (
    <>
      {/* Desktop view */}
      <section
        className="hidden lg:block relative w-full bg-[#f6f4ed] overflow-hidden"
        style={{ height: vw(1080) }}
      >
      {/* 1. Category Tabs */}
      <div
        className="relative w-full flex justify-center z-50"
        ref={constraintsRef}
        style={{
          paddingTop: vw(60),
          marginBottom: vw(60),
          paddingLeft: vw(100),
          paddingRight: vw(100),
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          className="flex cursor-grab active:cursor-grabbing"
          style={{ width: "max-content", gap: vw(60) }}
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeId;
            const slug = cat.slug;

            return (
              <button
                key={cat.id}
                id={slug ? `faq-${slug}` : undefined}
                onClick={() => setActiveId(cat.id)}
                className={`flex items-center transition-all duration-500 relative shrink-0 ${
                  isActive ? "scale-105 z-20" : "opacity-80 hover:opacity-100 z-10"
                }`}
              >
                {/* 1. Icon Circle (Always dark olive) */}
                <div
                  className="z-10 flex items-center justify-center rounded-full bg-[#756f3f] shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                  style={{ width: vw(72), height: vw(72) }}
                >
                  <div style={{ width: vw(32), height: vw(32) }}>
                    <IconifyIcon
                      name={cat.icon || "lucide:message-circle"}
                      color="white"
                      size="100%"
                    />
                  </div>
                </div>

                {/* 2. Pill Background: Color Inversion for Active State */}
                <div
                  className={`rounded-full border transition-all duration-500 flex flex-col justify-center ${
                    isActive ? "bg-[#756f3f] border-[#756f3f] shadow-lg" : "bg-[#dbd5ab] border-[#a0974d]"
                  }`}
                  style={{
                    height: vw(72),
                    minWidth: vw(180),
                    marginLeft: vw(-18),
                    paddingLeft: vw(35),
                    paddingRight: vw(30),
                  }}
                >
                  <span
                    className={`font-bold tracking-widest text-left transition-colors duration-500 ${
                      isActive ? "text-white" : "text-[#645c1d]"
                    }`}
                    style={{
                      fontSize: vw(20),
                      fontFamily: "var(--font-anaheim), sans-serif",
                      lineHeight: 1.05,
                      maxWidth: vw(200),
                    }}
                  >
                    {cat.title.split("&").map((p, i) => (
                      <React.Fragment key={i}>
                        {p.trim()}
                        {i < cat.title.split("&").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </span>
                </div>

                {/* 3. Layout Underline: Sliding Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="pill-underline"
                    className="absolute -bottom-2 left-4 right-0 h-[3px] bg-[#756f3f] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>
      </div>

      <div
        className="flex relative items-start"
        style={{ paddingLeft: vw(230), paddingRight: vw(230), gap: vw(100) }}
      >
        {/* 2. Left Column */}
        <div className="flex flex-col relative" style={{ width: vw(520) }}>
          <div
            className="absolute z-0 pointer-events-none select-none"
            style={{ left: vw(-140), top: vw(-210) }}
          >
            <motion.div
              key={`amp-decor-${activeId}`}
              initial={{ opacity: 0, rotate: -15, scale: 0.8, y: 0 }}
              animate={{ 
                opacity: 0.7, 
                rotate: -25, 
                scale: 1.2,
                y: [0, vw(-20) as any, 0]
              }}
              transition={{ 
                opacity: { duration: 1.5, ease: "easeOut" },
                rotate: { duration: 1.5, ease: "easeOut" },
                scale: { duration: 1.5, ease: "easeOut" },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="font-paytone-one leading-none select-none"
              style={{
                fontSize: vw(320),
                background:
                  "linear-gradient(to bottom, #f6f4ed 20%, #e6e0cc 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              &
            </motion.div>
          </div>

          <motion.h3
            key={`title-main-${activeId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#635B15] font-regular z-10 uppercase"
            style={{
              fontSize: vw(60),
              fontFamily: "var(--font-fredericka), serif",
              lineHeight: 1.5,
              letterSpacing: "-0.03em",
              whiteSpace: "pre-line",
              marginBottom: vw(35),
            }}
          >
            {activeCategory.title.split("&").join("\n")}
          </motion.h3>

          <motion.div
            key={`img-frame-${activeId}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[30px] overflow-hidden shadow-2xl relative z-10"
            style={{ width: vw(520), height: vw(520) }}
          >
            <OptimizedImage
              image={activeCategory.image}
              className="w-full h-full object-cover"
              size="large"
            />
          </motion.div>
        </div>

        {/* 3. Right Column */}
        <div className="flex-1 relative" style={{ paddingTop: vw(10) }}>
          <div
            ref={scrollRef}
            className="overflow-y-auto custom-scrollbar"
            style={{ height: vw(580), paddingRight: vw(60), overscrollBehaviorY: "contain" }}
            data-lenis-prevent
          >
            {activeCategory.faqs.map((faq, fIdx) => (
              <FaqItemRow 
                key={faq.id}
                faq={faq}
                fIdx={fIdx}
                isOpen={!!openFaqs[faq.id]}
                toggleFaq={toggleFaq}
                vw={vw}
              />
            ))}
          </div>

          {/* Scrollbar */}
          <div
            className="absolute rounded-full cursor-pointer select-none"
            onPointerDown={handleScrollbarPointerDown}
            style={{
              width: vw(16),
              height: vw(580),
              right: vw(10),
              top: vw(10),
              backgroundColor: "transparent",
            }}
          >
            {/* Visual Track */}
            <div 
              className="absolute bg-[#e0dbbc] rounded-full pointer-events-none"
              style={{
                width: vw(6),
                height: "100%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
            {/* Draggable/Animated Thumb */}
            <motion.div
              className="bg-[#756f3f] rounded-full pointer-events-none"
              style={{
                width: vw(6),
                height: "20%",
                top: scrollBarTop,
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Action Button */}
      <div
        className="absolute z-[100]"
        style={{ right: vw(240), bottom: vw(160) }}
      >
        <a
          href={data.selection?.viewButtonLink || "#"}
          className="group/btn block"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-between bg-[#756f3f] border border-[#756f3f] group-hover/btn:bg-white rounded-full shadow-2xl transition-all duration-300"
            style={{
              width: 'auto',
              height: vw(76),
              paddingLeft: vw(26),
              paddingRight: vw(9),
            }}
          >
            <span
              className="text-white group-hover/btn:text-[#756f3f] font-medium font-anaheim mx-3 transition-colors duration-300"
              style={{
                fontSize: vw(20),
              }}
            >
              {data.selection?.viewButtonText || "VIEW MORE"}
            </span>
            <div
              className="bg-white border border-transparent group-hover/btn:bg-[#756f3f] group-hover/btn:border-[#756f3f] rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
              style={{ width: vw(58), height: vw(58) }}
            >
              <div style={{ width: vw(24), height: vw(24) }}>
                <IconifyIcon
                  name="lucide:arrow-up-right"
                  className="text-[#756f3f] group-hover/btn:text-white transition-colors duration-300"
                  size="100%"
                />
              </div>
            </div>
          </motion.div>
        </a>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>

    {/* Mobile and Tablet view */}
    <section className="lg:hidden w-full bg-[#f6f4ed] py-12 px-6 flex flex-col items-center">
      {/* 1. Category Tabs */}
      <div className="w-full overflow-x-auto scrollbar-none flex gap-4 py-2 mb-6 select-none justify-start sm:justify-center">
        {categories.map((cat) => {
          const isActive = cat.id === activeId;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveId(cat.id)}
              className={`flex items-center shrink-0 gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                isActive
                  ? "bg-[#756f3f] border-[#756f3f] text-white shadow-md scale-105"
                  : "bg-[#dbd5ab] border-[#a0974d] text-[#645c1d] opacity-80"
              }`}
            >
              {cat.icon && (
                <div className="w-4 h-4 shrink-0">
                  <IconifyIcon
                    name={cat.icon}
                    color={isActive ? "white" : "#645c1d"}
                    size="100%"
                  />
                </div>
              )}
              <span className="font-bold text-sm tracking-wider font-anaheim whitespace-nowrap">
                {cat.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Title & Image Block */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center mb-6">
        <h3 className="text-[#635B15] font-regular uppercase text-3xl font-serif text-center leading-tight mb-4">
          {activeCategory.title}
        </h3>
        <div className="rounded-[24px] overflow-hidden shadow-lg aspect-square w-full">
          <OptimizedImage
            image={activeCategory.image}
            className="w-full h-full object-cover"
            size="large"
          />
        </div>
      </div>

      {/* 3. Accordion FAQ List */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2">
        {activeCategory.faqs.map((faq, fIdx) => {
          const isOpen = !!openFaqs[faq.id];
          const numStr = (fIdx + 1).toString().padStart(2, "0") + ".";
          return (
            <div
              key={faq.id}
              id={`faq-item-mobile-${faq.id}`}
              className="w-full border-b border-[#c7c3a5] pb-4"
            >
              <div
                className="flex items-start justify-between gap-4 cursor-pointer py-3"
                onClick={() => toggleFaq(faq.id)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-[#756f3f] font-semibold text-lg font-anaheim shrink-0 mt-0.5">
                    {numStr}
                  </span>
                  <h4 className="text-black font-bold font-anaheim text-lg leading-[1.3] m-0">
                    {faq.question}
                  </h4>
                </div>
                <div className="shrink-0 mt-1">
                  <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center rounded-full bg-[#ece6d0] w-7 h-7"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 5L16 12L9 19"
                        stroke="#676767"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-8 pr-2 pt-2 text-[#605b37] font-anaheim font-medium text-sm leading-[1.5] tracking-wide flex flex-col gap-4">
                      <LexicalRenderer content={faq.answer} />
                      {faq.image && (
                        <div className="w-full max-w-xs mt-3 rounded-xl overflow-hidden border border-black/5 shadow-sm">
                          <OptimizedImage
                            image={faq.image}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* 4. Action Button */}
      {data.selection?.viewButtonText && (
        <div className="w-full px-6 mt-8 flex justify-center">
          <a
            href={data.selection?.viewButtonLink || "#"}
            className="w-full max-w-xs"
          >
            <button className="w-full py-4 rounded-full bg-[#756f3f] text-white font-bold font-anaheim uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-md">
              <span>{data.selection?.viewButtonText}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-white stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </a>
        </div>
      )}
    </section>
  </>
  );
}

interface FaqDetailSectionProps {
  data: {
    items: any[];
    selection: any;
  };
  locale: string;
  activeId: string | null;
  setActiveId: (id: string) => void;
}
