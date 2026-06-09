"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Icon } from "@iconify/react";

const DESIGN_WIDTH = 1920;
const MOBILE_DESIGN_WIDTH = 375;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;
const mvw = (px: number) => `${(px / MOBILE_DESIGN_WIDTH) * 100}vw`;

interface FaqSearchSectionProps {
  data: any;
  locale: string;
  detailData?: any;
  onSearchSelect?: (categoryId: string, faqId: string) => void;
}

export function FaqSearchSection({
  data,
  locale,
  detailData,
  onSearchSelect,
}: FaqSearchSectionProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rvw = isMobile ? mvw : vw;

  // Map linkJump fields to tactical UI elements
  const btnText = data.linkJump?.title || data.btnText || "";
  const placeholder = data.linkJump?.description || data.placeholder || "";

  // 扁平化数据以便搜索
  const allFaqs = React.useMemo(() => {
    if (!detailData?.items) return [];
    return detailData.items.flatMap((category: any) => {
      const catId = category.id || category.category?.id;
      return (category.faqs || []).map((faq: any) => ({
        ...faq,
        categoryId: catId,
        categoryTitle: category.title,
      }));
    });
  }, [detailData]);

  // 实时搜索逻辑
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const filtered = allFaqs
      .filter((faq: any) =>
        faq.question.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);

    setResults(filtered);
    setIsOpen(filtered.length > 0);
  }, [query, allFaqs]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section
      className="relative w-full flex items-center justify-center z-[10]"
      style={{ padding: isMobile ? `${mvw(40)} 0` : `${vw(100)} 0` }}
    >
      <div
        className="relative w-full mx-auto"
        style={{
          maxWidth: isMobile ? "92vw" : vw(1860),
          height: isMobile ? mvw(300) : vw(540),
        }}
      >
        {/* Background Wrapper - Only this handles clipping for BG elements */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: isMobile ? mvw(30) : vw(60) }}
        >
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <OptimizedImage
              image={data.image}
              alt="Search Background"
              className="w-full h-full object-cover"
              size={isMobile ? "medium" : "xlarge"}
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2.1px]" />
          </div>

          {/* Background Huge Text */}
          <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-10">
            <motion.h2
              animate={{
                backgroundPosition: ["-100% center", "100% center"],
              }}
              transition={{
                backgroundPosition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              className="select-none leading-none text-center font-bold uppercase"
              style={{
                fontFamily: "var(--font-anton), sans-serif",
                fontSize: isMobile ? mvw(60) : vw(160),
                letterSpacing: isMobile ? mvw(15) : vw(40),
                background:
                  "linear-gradient(110deg, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0.3) 70%)",
                backgroundSize: "200% auto",
                backgroundRepeat: "repeat",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                opacity: 0.8,
                paddingTop: isMobile ? mvw(50) : vw(90),
                filter: "drop-shadow(0 0 10px rgba(255,255,255,0.1))",
              }}
            >
              {data.bgText || "BUSROM"}
            </motion.h2>
          </div>
        </div>

        {/* Content Layer - No overflow hidden here */}
        <div
          className="relative z-20 h-full flex flex-col items-center justify-between"
          style={{
            padding: isMobile
              ? `${mvw(60)} ${mvw(16)} ${mvw(32)}`
              : `${vw(80)} ${vw(24)} ${vw(40)}`
          }}
        >
          {/* Section Title */}
          {data.title && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="text-white text-center font-anaheim font-bold uppercase"
                style={{
                  fontSize: isMobile ? mvw(24) : vw(52),
                  letterSpacing: isMobile ? mvw(4) : vw(10.4),
                  lineHeight: 1.2,
                }}
              >
                {data.title.map((node: any, i: number) => {
                  if (node.type === "text")
                    return <span key={i}>{node.text}</span>;
                  if (node.type === "linebreak") return <br key={i} />;
                  return null;
                })}
              </div>
            </motion.div>
          )}

          {/* Search Bar Group - Relative to this div */}
          <div
            ref={containerRef}
            className="relative w-full"
            style={{ maxWidth: isMobile ? "100%" : vw(1604) }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex items-center backdrop-blur-[7.7px] shadow-2xl z-30"
              style={{
                width: "100%",
                height: isMobile ? mvw(48) : vw(106),
                borderRadius: isMobile ? mvw(12) : vw(24),
                padding: isMobile ? `0 ${mvw(10)}` : `0 ${vw(32)}`,
                backgroundColor: "rgba(255, 255, 255, 0.77)",
              }}
            >
              <div className="flex items-center flex-1 min-w-0" style={{ gap: isMobile ? mvw(8) : vw(16) }}>
                <div
                  className="flex-shrink-0 flex items-center justify-center text-[#756f3f]"
                  style={{ width: isMobile ? mvw(24) : vw(32), height: isMobile ? mvw(24) : vw(32) }}
                >
                  <Icon
                    icon="streamline-sharp:magnifying-glass"
                    className="w-full h-full"
                  />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length >= 2 && setIsOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && results.length > 0) {
                      onSearchSelect?.(results[0].categoryId, results[0].id);
                      setIsOpen(false);
                      setQuery("");
                    }
                  }}
                  placeholder={placeholder}
                  spellCheck="false"
                  className="bg-transparent border-none outline-none flex-1 min-w-0 text-[#585858] font-anaheim placeholder:text-[#585858]/60"
                  style={{ fontSize: isMobile ? mvw(14) : vw(18) }}
                />
              </div>

              {!isMobile && (
                <button
                  onClick={() => {
                    if (results.length > 0) {
                      onSearchSelect?.(results[0].categoryId, results[0].id);
                      setIsOpen(false);
                      setQuery("");
                    }
                  }}
                  className="flex-shrink-0 bg-[#756f3f] text-white font-anaheim font-semibold tracking-widest uppercase hover:bg-[#8a844a] transition-colors flex items-center justify-center"
                  style={{
                    height: vw(50),
                    padding: `0 ${vw(44)}`,
                    borderRadius: vw(28),
                    fontSize: vw(18),
                    letterSpacing: vw(3.2),
                    gap: vw(8),
                  }}
                >
                  <span className="block">{btnText}</span>
                  <Icon
                    icon="ep:top-right"
                    style={{ width: vw(24), height: vw(24) }}
                  />
                </button>
              )}
            </motion.div>

            {/* Search Dropdown Results */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 10 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
                  style={{
                    borderRadius: isMobile ? mvw(16) : vw(24),
                    padding: rvw(16),
                    top: "100%",
                    marginTop: rvw(10)
                  }}
                >
                  <div className="flex flex-col">
                    {results.map((result, idx) => (
                      <button
                        key={result.id || idx}
                        onClick={() => {
                          onSearchSelect?.(result.categoryId, result.id);
                          setIsOpen(false);
                          setQuery("");
                        }}
                        className="flex flex-col items-start w-full text-left rounded-xl transition-colors group"
                        style={{ padding: rvw(16) }}
                      >
                        <span className="text-[#585858] font-anaheim font-semibold group-hover:text-[#756f3f] line-clamp-1" style={{ fontSize: isMobile ? mvw(14) : vw(18) }}>
                          {result.question}
                        </span>
                        <span className="text-[#585858]/60 font-anaheim uppercase mt-[0.2vw]" style={{ fontSize: isMobile ? mvw(10) : vw(12), letterSpacing: "0.1em" }}>
                          {result.categoryTitle}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
