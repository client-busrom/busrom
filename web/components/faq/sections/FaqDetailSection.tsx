"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  title: string;
  artText: string;
  image: any;
  icon?: string;
  faqs: FaqItem[];
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

export function FaqDetailSection({
  data,
  locale,
  activeId,
  setActiveId,
}: FaqDetailSectionProps) {
  const categories: CategoryData[] = (data.items || []).map((cat, idx) => ({
    id: cat.id || `cat-${idx}`,
    title: cat.title || "",
    artText: cat.artText || "",
    image: cat.image,
    faqs: cat.faqs || [],
    icon: cat.icon || "lucide:message-circle",
  }));

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
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(progress);
    }
  };

  const constraintsRef = React.useRef<HTMLDivElement>(null);

  if (!activeCategory) return null;

  return (
    <section
      className="relative w-full bg-[#f6f4ed] overflow-hidden"
      style={{ height: vw(922) }}
    >
      {/* 1. Category Tabs */}
      <div
        className="relative w-full flex justify-center z-50"
        ref={constraintsRef}
        style={{ paddingTop: vw(50), marginBottom: vw(100), paddingLeft: vw(100), paddingRight: vw(100) }}
      >
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          className="flex cursor-grab active:cursor-grabbing"
          style={{ width: "max-content", gap: vw(60) }}
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeId;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveId(cat.id)}
                className={`flex items-center transition-all duration-500 relative shrink-0 ${
                  isActive ? "opacity-100" : "opacity-40 grayscale hover:opacity-100"
                }`}
              >
                <div
                  className="z-10 flex items-center justify-center rounded-full bg-[#756f3f] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
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

                <div
                  className="bg-[#dbd5ab] rounded-full border border-[#a0974d] flex flex-col justify-center"
                  style={{ 
                    height: vw(72), 
                    minWidth: vw(180), 
                    marginLeft: vw(-18), 
                    paddingLeft: vw(35), 
                    paddingRight: vw(30) 
                  }}
                >
                  <span
                    className="font-bold text-[#645c1d] tracking-widest text-left"
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
              </button>
            );
          })}
        </motion.div>
      </div>

      <div className="flex relative items-start" style={{ paddingLeft: vw(230), paddingRight: vw(230), gap: vw(100) }}>
        {/* 2. Left Column */}
        <div className="flex flex-col relative" style={{ width: vw(520) }}>
          <div
            className="absolute z-0 pointer-events-none select-none"
            style={{ left: vw(-80), top: vw(-60) }}
          >
            <motion.div
              key={`amp-decor-${activeId}`}
              initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
              animate={{ opacity: 0.7, rotate: -25, scale: 1.2 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <svg width={vw(248)} height={vw(300)} viewBox="0 0 248 300" fill="none">
                <defs>
                  <linearGradient id="ampGradPrecise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#efead8" />
                    <stop offset="100%" stopColor="#e2dcc5" />
                  </linearGradient>
                </defs>
                <path
                  d="M124 280C140 280 160 260 160 230C160 210 150 195 130 185C160 170 185 140 185 100C185 50 150 20 110 20C65 20 30 60 30 110C30 140 45 165 70 185C50 195 40 210 40 230C40 260 60 280 76 280H124V280ZM124 165C138 155 145 130 145 100C145 70 135 45 110 45C85 45 70 70 70 100C70 130 77 155 91 165H124ZM120 255H80C75 255 70 250 70 240C70 230 75 225 80 225H120C125 225 130 230 130 240C130 250 125 255 120 255Z"
                  fill="url(#ampGradPrecise)"
                />
              </svg>
            </motion.div>
          </div>

          <motion.h3
            key={`title-main-${activeId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#645c1d] font-bold z-10 uppercase"
            style={{
              fontSize: vw(54),
              fontFamily: "var(--font-fredericka), serif",
              lineHeight: 1.1,
              whiteSpace: "pre-line",
              marginBottom: vw(35)
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
            onScroll={handleScroll}
            className="overflow-y-auto custom-scrollbar"
            style={{ height: vw(520), paddingRight: vw(60) }}
            data-lenis-prevent
          >
            {activeCategory.faqs.map((faq, fIdx) => {
              const isOpen = !!openFaqs[faq.id];
              const numStr = (fIdx + 1).toString().padStart(2, "0") + ".";

              return (
                <div key={faq.id} className="w-full border-t border-[#c7c3a5] first:border-t-2">
                  <div
                    className="group cursor-pointer flex items-start"
                    style={{ paddingTop: vw(35), paddingBottom: vw(35), gap: vw(30) }}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span
                      className="text-[#756f3f] font-medium leading-none"
                      style={{
                        fontSize: vw(36),
                        fontFamily: "var(--font-anaheim), sans-serif",
                        marginTop: vw(8)
                      }}
                    >
                      {numStr}
                    </span>

                    <h1
                      className="text-black font-bold flex-1 leading-[1.2]"
                      style={{
                        fontSize: vw(38),
                        fontFamily: "var(--font-anaheim), sans-serif"
                      }}
                    >
                      {faq.question}
                    </h1>

                    {/* Action Slot: Shows Arrow when closed, Image when open */}
                    <div className="relative shrink-0" style={{ width: vw(180), height: vw(60) }}>
                      <AnimatePresence mode="wait">
                        {!isOpen ? (
                          <motion.div
                            key="arrow"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center justify-center rounded-full bg-[#ece6d0] absolute right-0"
                            style={{ width: vw(60), height: vw(60), marginTop: vw(4) }}
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
                              className="rounded-[20px] overflow-hidden border border-white/10 absolute right-0 top-0"
                              style={{ width: vw(180), height: vw(180) }}
                            >
                              <OptimizedImage
                                image={faq.image}
                                className="w-full h-full object-cover"
                              />
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
                        <div className="flex" style={{ paddingBottom: vw(40), paddingLeft: vw(88), paddingRight: vw(220) }}>
                          <div
                            className="flex-1 text-[#605b37]"
                            style={{
                              fontSize: vw(22),
                              lineHeight: 1.4,
                              fontFamily: "var(--font-anaheim), sans-serif"
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
            })}
          </div>

          {/* Scrollbar */}
          <div
            className="absolute bg-[#e0dbbc] rounded-full"
            style={{ width: vw(6), height: vw(520), right: vw(10), top: vw(10) }}
          >
            <motion.div
              className="w-full bg-[#756f3f] rounded-full"
              style={{
                height: "20%",
                top: `${scrollProgress * 80}%`,
                position: "absolute",
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Action Button */}
      <div className="absolute z-[100]" style={{ right: vw(80), bottom: vw(80) }}>
        <a
          href={data.selection?.viewButtonLink || "#"}
          className="group/btn block"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-between bg-[#756f3f] rounded-full shadow-2xl"
            style={{
              width: vw(320),
              height: vw(76),
              paddingLeft: vw(26),
              paddingRight: vw(9)
            }}
          >
            <span
              className="text-white font-bold tracking-widest"
              style={{
                fontSize: vw(20),
                fontFamily: "var(--font-lexend-deca), sans-serif"
              }}
            >
              {data.selection?.viewButtonText || "VIEW MORE"}
            </span>
            <div
              className="bg-white rounded-full flex items-center justify-center shrink-0"
              style={{ width: vw(58), height: vw(58) }}
            >
              <div style={{ width: vw(24), height: vw(24) }}>
                <IconifyIcon
                  name="lucide:arrow-up-right"
                  color="#756f3f"
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
