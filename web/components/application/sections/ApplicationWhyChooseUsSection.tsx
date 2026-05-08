"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HollowText } from "@/components/common/HollowText";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface WhyChooseUsItem {
  id: string;
  number: string;
  title: string;
  description: string;
  descriptionParts?: { text: string; bold?: boolean }[];
  imageLeft: string;
  imageRight: string;
}

const defaultItems: WhyChooseUsItem[] = [
  {
    id: "1",
    number: "01",
    title: "Customized\nEngineering Solutions",
    description:
      "We provide tailor-made engineering designs and technical support for high-end applications, ensuring optimal performance and efficiency for your specific needs.",
    imageLeft: "/images/application/why-1.png",
    imageRight: "/images/application/why-2.png",
  },
  {
    id: "2",
    number: "02",
    title: "Rigorous Quality\nControl Systems",
    description:
      "Our multi-stage testing and inspection processes guarantee that every product meets the highest international standards, providing reliability in the most demanding environments.",
    imageLeft: "/images/application/why-3.png",
    imageRight: "/images/application/why-4.png",
  },
  {
    id: "3",
    number: "03",
    title: "Global Supply\nChain Excellence",
    description:
      "Leveraging our extensive network, we ensure stable material sourcing and efficient logistics, reducing lead times and costs for your large-scale global projects.",
    imageLeft: "/images/application/why-5.png",
    imageRight: "/images/application/why-6.png",
  },
];

interface ApplicationWhyChooseUsSectionProps {
  decorate?: string;
  title?: string;
  items?: WhyChooseUsItem[];
}

export function ApplicationWhyChooseUsSection({
  decorate = "Why",
  title = "contractors choose us?",
  items = defaultItems,
}: ApplicationWhyChooseUsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = items[currentIndex % items.length];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <section
      className="relative w-full select-none"
      style={{ height: vw(922) }}
    >
      {/* 
        Main 1920 container with overflow-hidden to clip width overflow.
        Shifted up to allow top text to be visible within its clipped boundary.
      */}
      <div
        className="absolute left-1/2 -translate-x-1/2 overflow-hidden"
        style={{ 
          width: vw(1920), 
          top: vw(-150), 
          height: vw(922 + 150) 
        }}
      >
        {/* Left Gradient Box & Clipped "Why" Title (White Layer) */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: 0,
            top: vw(3 + 150),
            width: vw(550),
            height: vw(919),
            zIndex: 10,
          }}
        >
          {/* Gradient Background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, #D4C75F -40%, #6E6731 100%)",
            }}
          />

          {/* Layer 1: White Hollow Title (Clipped by box) */}
          <HollowText
            strokeColor="#FFFFFF"
            strokeWidth={1.5}
            className="absolute font-extrabold whitespace-nowrap"
            style={{
              left: vw(495.5),
              top: vw(-103), // Relative to box top
              fontSize: vw(200),
              fontFamily: "var(--font-anaheim), sans-serif",
            }}
          >
            {decorate}
          </HollowText>
        </div>

        {/* Layer 2: Olive Hollow Title (Outside the box) */}
        <HollowText
          strokeColor="#756F3F"
          strokeWidth={1.5}
          className="absolute font-extrabold whitespace-nowrap"
          style={{
            left: vw(495.5),
            top: vw(-100 + 150), // Matches Layer 1 absolute position
            fontSize: vw(200),
            fontFamily: "var(--font-anaheim), sans-serif",
            zIndex: 6,
          }}
        >
          {decorate}
        </HollowText>

        {/* contractors choose us? Header */}
        <h4
          className="absolute font-extrabold"
          style={{
            left: vw(726),
            top: vw(10 + 150),
            fontSize: vw(96),
            lineHeight: vw(108),
            fontFamily: "var(--font-anaheim), sans-serif",
            color: "#756F3F",
            zIndex: 10,
            maxWidth: vw(1920 - 726),
          }}
        >
          {title}
        </h4>

        {/* Carousel Content Area */}
        <div
          className="absolute"
          style={{
            left: vw(550),
            top: vw(123 + 150),
            width: vw(1370),
            height: vw(799),
            backgroundColor: "#A59E69",
            zIndex: 5,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {/* Item Title */}
              <div
                className="absolute"
                style={{
                  left: vw(807 - 550),
                  top: vw(233 - 156),
                  width: vw(1920 - 807),
                }}
              >
                {/* Shadow layer */}
                <h5
                  className="absolute whitespace-pre text-left"
                  style={{
                    left: vw(2),
                    top: vw(10),
                    fontSize: vw(56),
                    fontFamily: "var(--font-black-han-sans), sans-serif",
                    color: "#766900",
                    lineHeight: vw(67),
                    width: "100%",
                  }}
                >
                  {currentItem.title}
                </h5>
                {/* Main layer */}
                <h5
                  className="relative whitespace-pre text-left"
                  style={{
                    fontSize: vw(56),
                    fontFamily: "var(--font-black-han-sans), sans-serif",
                    color: "#FFF6B1",
                    lineHeight: vw(67),
                    width: "100%",
                  }}
                >
                  {currentItem.title}
                </h5>
              </div>

              {/* Item Number & Line */}
              <div
                className="absolute flex items-center"
                style={{ left: vw(812 - 550), top: vw(597 - 156) }}
              >
                <span
                  style={{
                    fontSize: vw(102),
                    fontFamily: "var(--font-anaheim), sans-serif",
                    fontWeight: "bold",
                    color: "#544D0F",
                  }}
                >
                  {currentItem.number}
                </span>
                <div
                  className="ml-6"
                  style={{
                    width: vw(234),
                    height: vw(2),
                    backgroundColor: "#544D0F",
                  }}
                />
              </div>

              {/* Item Description */}
              <p
                className="absolute text-black whitespace-pre-line"
                style={{
                  left: vw(812 - 550),
                  top: vw(377 - 136),
                  width: vw(700),
                  fontSize: vw(29),
                  lineHeight: vw(46),
                  fontFamily: "var(--font-anaheim), sans-serif",
                }}
              >
                {currentItem.descriptionParts
                  ? currentItem.descriptionParts.map((part, idx) => (
                      <span
                        key={idx}
                        style={{
                          color: part.bold ? "#FFEE53" : "inherit",
                          fontWeight: part.bold ? "bold" : "normal",
                        }}
                      >
                        {part.text}
                      </span>
                    ))
                  : currentItem.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div
            className="absolute flex flex-col gap-4"
            style={{
              left: vw(1725 - 550),
              top: vw(424 - 123 - 140),
              zIndex: 50,
            }}
          >
            {[
              { onClick: handleNext, rotate: false },
              { onClick: handlePrev, rotate: true },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                className={`
                  group rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                  bg-white/20 border border-white/60
                  hover:bg-white hover:border-transparent hover:shadow-lg
                  active:bg-[#756F3F] active:border-transparent
                `}
                style={{ width: vw(54), height: vw(54) }}
              >
                <svg
                  viewBox="0 0 14 24"
                  fill="none"
                  className={`transition-colors duration-300 ${btn.rotate ? "rotate-180" : ""}`}
                  style={{ width: vw(12), height: vw(20) }}
                >
                  <path
                    d="M1 23L12 12L1 1"
                    className="
                      stroke-white 
                      group-hover:stroke-[#A59E69] 
                      group-active:stroke-white
                    "
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Global Floating Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`imgs-${currentItem.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            {/* Rectangle 403 - Left Large Image */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: vw(176 + 55),
                top: vw(123 + 150),
                width: vw(500),
                height: vw(700),
                borderRadius: `${vw(147)} 0 ${vw(147)} 0`,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                zIndex: 40,
              }}
            >
              <OptimizedImage
                image={currentItem.imageLeft}
                alt="solution-left"
                className="w-full h-full object-cover"
                size="medium"
              />
            </div>

            {/* Rectangle 405 - Right Small Image */}
            <div
              className="absolute overflow-hidden"
              style={{
                right: 0,
                top: vw(740 - 156 + 150),
                width: vw(650),
                height: vw(240),
                borderRadius: `0 0 0 ${vw(147)}`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                zIndex: 40,
              }}
            >
              <OptimizedImage
                image={currentItem.imageRight}
                alt="solution-right"
                className="w-full h-full object-cover"
                size="medium"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
