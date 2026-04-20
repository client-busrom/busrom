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
}

interface CategoryData {
  id: string;
  title: string;
  artText: string;
  image: any;
  faqs: FaqItem[];
}

interface FaqDetailSectionProps {
  data: {
    items: any[];
    selection: any;
  };
  locale: string;
}

// Fixed Category metadata based on design icons and labels using Lucide icons via Iconify
const CATEGORY_META = [
  { id: "cat-1", icon: "lucide:home", label: "CONSULTATION" },
  { id: "cat-2", icon: "lucide:settings", label: "PLANNING" },
  { id: "cat-3", icon: "lucide:wrench", label: "INSTALLATION" },
  { id: "cat-4", icon: "lucide:shield-check", label: "WARRANTY" },
  { id: "cat-5", icon: "lucide:message-circle", label: "SUPPORT" },
];

export function FaqDetailSection({ data, locale }: FaqDetailSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Group items from CMS into categories
  // Note: Assuming detail.items are grouped or marked by markers in Lexical
  // For now, let's treat the carousel/selection items as categories if available
  // Or just use the first few items as categories
  const categories: CategoryData[] = (data.items || []).map((item, idx) => ({
    id: `cat-${idx}`,
    title: item.title || CATEGORY_META[idx]?.label || `Category ${idx + 1}`,
    artText: item.artText || "QUALITY\nASSURANCE", // Fallback for Fredericka font area
    image: item.image,
    faqs: item.faqs || [],
  }));

  const activeCategory = categories[activeTab];

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  if (!activeCategory) return null;

  return (
    <section 
      className="relative w-full bg-[#f6f4ed] pb-[vw(100)]"
      style={{ minHeight: vw(922) }}
    >
      {/* Category Tabs */}
      <div className="flex justify-center gap-[vw(60)] pt-[vw(50)] mb-[vw(80)]">
        {CATEGORY_META.map((meta, idx) => (
          <button
            key={meta.id}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-[vw(15)] transition-all duration-300 ${activeTab === idx ? "opacity-100 scale-105" : "opacity-40 grayscale hover:opacity-70"}`}
          >
            <div 
              className="flex items-center justify-center rounded-full bg-[#756f3f] shadow-lg"
              style={{ width: vw(71), height: vw(71) }}
            >
              <IconifyIcon name={meta.icon} color="white" size={32} />
            </div>
            <span 
              className="font-bold text-[#756f3f] tracking-widest whitespace-nowrap"
              style={{ fontSize: vw(24), fontFamily: "var(--font-anaheim), sans-serif" }}
            >
              {meta.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex px-[vw(230)] gap-[vw(80)]">
        {/* Left: Artistic Sidebar */}
        <div className="flex flex-col w-[vw(520)] mt-[vw(20)]">
          <motion.div
            key={`art-${activeTab}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-[vw(40)]"
          >
             <h4 
               className="text-[#635b15] leading-[1.3]"
               style={{ 
                 fontFamily: "var(--font-fredericka), serif", 
                 fontSize: vw(60), 
                 letterSpacing: vw(-2.4),
                 whiteSpace: "pre-line"
               }}
             >
               {activeCategory.artText}
             </h4>
          </motion.div>

          {/* Category Image */}
          <motion.div 
            key={`img-${activeTab}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[30px] overflow-hidden shadow-2xl relative"
            style={{ width: vw(520), height: vw(520) }}
          >
             <OptimizedImage
               image={activeCategory.image}
               className="w-full h-full object-cover"
             />
          </motion.div>
        </div>

        {/* Right: FAQ Accordion List */}
        <div className="flex-1 flex flex-col pt-[vw(20)]">
          <div className="flex flex-col gap-[vw(20)]">
            {activeCategory.faqs.map((faq) => (
              <div 
                key={faq.id}
                className="border-b border-[#756f3f]/30 pb-[vw(20)]"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span 
                    className="font-bold text-[#0f0e03] hover:text-[#756f3f] transition-colors pr-[vw(40)]"
                    style={{ fontSize: vw(28), fontFamily: "var(--font-anaheim), sans-serif" }}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                    className="flex-shrink-0"
                  >
                    <IconifyIcon name="lucide:chevron-down" color="#756f3f" size={32} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div 
                        className="pt-[vw(30)] pb-[vw(10)] text-[#3c3607] font-medium"
                        style={{ fontSize: vw(18), lineHeight: 1.6, fontFamily: "var(--font-anaheim), sans-serif" }}
                      >
                         <LexicalRenderer content={faq.answer} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <div className="flex justify-end mt-[vw(60)]">
            <button 
              className="flex items-center justify-center gap-[vw(15)] bg-[#756f3f] rounded-full px-[vw(40)] py-[vw(15)] hover:bg-[#58542f] transition-all"
            >
              <span className="text-white font-bold tracking-widest" style={{ fontSize: vw(20) }}>
                VIEW MORE
              </span>
              <IconifyIcon name="lucide:arrow-right" color="white" size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
