"use client";

import React from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface MediaObject {
  url: string;
  id: string;
}

interface BrandProspectItem {
  title: string;
  description: string;
  image: MediaObject | null;
}

interface StoryBrandProspectSectionProps {
  data: {
    title: string;
    tips?: string;
    items: {
      slides: BrandProspectItem[];
    };
    logoImage: MediaObject | null;
  };
}

/**
 * Helper to style text within double quotes or smart quotes
 */
function formatQuotedText(text: string, isMobile: boolean = false) {
  if (!text) return null;

  // 1. Convert any escaped newlines to real newlines
  const normalizedText = text.toString().replace(/\\n/g, "\n");

  // 2. Helper to render text segments with manual <br /> tags
  const renderWithBreaks = (content: string) => {
    if (!content) return null;
    const lines = content.split(/\n/);
    return lines.map((line, i) => (
      <React.Fragment key={`${line}-${i}`}>
        {line}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // 3. Regex that handles multi-line quotes and different quote characters
  const parts = normalizedText.split(/([\"“][\s\S]*?[\"”])/g);

  return parts.map((part, index) => {
    if (!part) return null;

    const isQuoted =
      (part.startsWith('"') || part.startsWith("“")) &&
      (part.endsWith('"') || part.endsWith("”"));

    if (isQuoted) {
      return (
        <span
          key={`quoted-${index}`}
          className="font-bold text-[#ff7c02] inline-block"
          style={{
            fontSize: isMobile ? "20px" : vw(32),
            whiteSpace: "pre-wrap",
          }}
        >
          {renderWithBreaks(part)}
        </span>
      );
    }

    return (
      <span key={`text-${index}`} style={{ whiteSpace: "pre-wrap" }}>
        {renderWithBreaks(part)}
      </span>
    );
  });
}

export function StoryBrandProspectSection({
  data,
}: StoryBrandProspectSectionProps) {
  const [windowWidth, setWindowWidth] = React.useState(0);
  const slides = data?.items?.slides || [];
  const logoImage = data?.logoImage;

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth > 0 && windowWidth < 1024;

  if (isMobile) {
    return (
      <section
        className="relative w-full overflow-hidden bg-[#f6f4ed] pb-20"
        style={{
          background: "linear-gradient(to bottom, #f6f4ed, #f8efce)",
        }}
      >
        {/* Mobile Floating Decorative Item */}
        <motion.div
          className="absolute bg-[#f1ead1] pointer-events-none rounded-full"
          style={{
            right: -50,
            top: -20,
            width: "180px",
            height: "180px",
            opacity: 0.8,
          }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 w-full px-6 pt-12 flex flex-col items-center max-w-[768px] mx-auto">
          {/* Mobile Title */}
          <h2
            className="font-josefin-sans font-bold text-[#574f0e] text-center mb-12"
            style={{ fontSize: "64px", lineHeight: 0.95 }}
          >
            {data.title}
          </h2>

          {/* Item 1: Dashed Box */}
          {slides[0] && (
            <div
              className="w-full relative flex flex-col items-center p-6 mb-16"
              style={{
                backgroundColor: "rgba(233, 223, 187, 0.38)",
                borderRadius: "24px",
              }}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="none"
                  stroke="#ad9f32"
                  strokeWidth="1"
                  strokeDasharray="8 4"
                  rx="24"
                  ry="24"
                />
              </svg>
              <div className="w-full aspect-[1.5] rounded-[20px] overflow-hidden mb-6">
                <OptimizedImage
                  image={slides[0].image}
                  className="object-cover w-full h-full"
                  size="medium"
                />
              </div>
              <div className="font-josefin-sans font-semibold text-[#574f0e] text-center text-[18px] leading-tight">
                {formatQuotedText(slides[0].description, isMobile)}
              </div>
            </div>
          )}

          {/* Item 2 & 3: Simplified Stacks */}
          <div className="w-full flex flex-col gap-16">
            {slides[1] && (
              <div className="flex flex-col items-center gap-6">
                <div className="w-[200px] h-[200px] rounded-[24px] overflow-hidden shadow-lg">
                  <OptimizedImage
                    image={slides[1].image}
                    className="object-cover w-full h-full"
                    size="small"
                  />
                </div>
                <div className="font-josefin-sans font-medium text-[#574f0e] text-center text-[16px] leading-relaxed px-4">
                  {formatQuotedText(slides[1].description, isMobile)}
                </div>
              </div>
            )}

            {slides[2] && (
              <div className="flex flex-col items-center gap-6">
                <div className="w-[200px] h-[200px] rounded-[24px] overflow-hidden shadow-lg">
                  <OptimizedImage
                    image={slides[2].image}
                    className="object-cover w-full h-full"
                    size="small"
                  />
                </div>
                <div className="font-josefin-sans font-medium text-[#574f0e] text-center text-[16px] leading-relaxed px-4">
                  {formatQuotedText(slides[2].description, isMobile)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Logo */}
        {logoImage && (
          <div className="mt-20 w-full px-4 flex justify-center opacity-40">
             <OptimizedImage image={logoImage} className="w-full max-w-[500px] object-contain" size="medium" />
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: vw(1444),
        background: "linear-gradient(to bottom, #f6f4ed, #f8efce)",
      }}
    >
      {/* Floating Decorative Item (bPWLu Ellipse 108) */}
      <motion.div
        className="absolute bg-[#f1ead1] pointer-events-none"
        style={{
          right: vw(40),
          top: vw(0),
          width: vw(275),
          height: vw(275),
          borderRadius: "50%",
          opacity: 1,
        }}
        animate={{
          y: [0, 30, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        {/* 1. Future Prospect Title (VU2Hn) */}
        <div
          className="absolute"
          style={{ right: vw(160), top: vw(120), width: vw(636) }}
        >
          <h2
            className="font-josefin-sans font-bold text-[#574f0e] text-right whitespace-pre-line"
            style={{ fontSize: vw(120), lineHeight: 0.875 }}
          >
            {data.title}
          </h2>
        </div>

        {/* 2. Side Tips (BpxUN) */}
        <div className="absolute" style={{ left: vw(152), bottom: vw(145) }}>
          <div
            className="font-josefin-sans font-bold text-[#574f0e] origin-left -rotate-90 tracking-[4px] whitespace-nowrap"
            style={{ fontSize: vw(28) }}
          >
            {data.tips || "Our Vision"}
          </div>
        </div>

        {/* 3. Prospect Items */}

        {/* Item 1 (xRzGI): Framed Box Layout */}
        {slides[0] && (
          <div
            className="absolute flex flex-col items-center"
            style={{
              left: vw(314),
              top: vw(97),
              width: vw(689),
              backgroundColor: "rgba(233, 223, 187, 0.38)", // #e9dfbb at ~38% opacity
              borderRadius: vw(30),
              paddingTop: vw(38),
              paddingBottom: vw(60),
            }}
          >
            {/* Custom Dashed Border Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              style={{ borderRadius: vw(30) }}
            >
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="none"
                stroke="#ad9f32"
                strokeWidth="1"
                strokeDasharray="8 4"
                style={{ rx: vw(30), ry: vw(30) }}
              />
            </svg>

            <div
              className="relative"
              style={{
                width: vw(606),
                height: vw(394),
                borderRadius: vw(30),
                overflow: "hidden",
              }}
            >
              <OptimizedImage
                image={slides[0].image}
                className="object-cover w-full h-full"
                size="medium"
              />
            </div>
            <div
              className="font-josefin-sans font-semibold text-[#574f0e] text-left mt-12 whitespace-pre-line"
              style={{
                width: vw(625),
                fontSize: vw(30),
                letterSpacing: vw(-0.6),
                lineHeight: 1.16,
              }}
            >
              {formatQuotedText(slides[0].description, isMobile)}
            </div>
          </div>
        )}

        {/* Item 2 (FTqXd): Text wrapped around right-floated image */}
        {slides[1] && (
          <div
            className="absolute"
            style={{
              right: vw(180) /* 1920 - 1079 - 661 ~= 180 */,
              top: vw(600),
              width: vw(664),
            }}
          >
            {/* Floated Image within text block */}
            <div
              style={{
                float: "right",
                width: vw(277),
                height: vw(287),
                marginLeft: vw(24),
                marginBottom: vw(24), // Buffer to ensure text flows nicely under it
                borderRadius: vw(30),
                overflow: "hidden",
              }}
            >
              <OptimizedImage
                image={slides[1].image}
                className="object-cover w-full h-full"
                size="medium"
              />
            </div>

            {/* Container for wrapping text */}
            <div
              className="font-josefin-sans font-medium text-[#574f0e] text-right whitespace-pre-line"
              style={{
                fontSize: vw(24),
                letterSpacing: vw(-0.48),
                lineHeight: 1.25,
                paddingTop: vw(110), // Text starts 110px below the top of the image
              }}
            >
              {formatQuotedText(slides[1].description, isMobile)}
            </div>
          </div>
        )}

        {/* Item 3 (qOmoH): Side-by-side flex container */}
        {slides[2] && (
          <div
            className="absolute flex items-center"
            style={{ left: vw(152), top: vw(1080) }}
          >
            <div
              className="relative shrink-0"
              style={{
                marginLeft: vw(54),
                width: vw(209),
                height: vw(216),
                borderRadius: vw(30),
                overflow: "hidden",
              }}
            >
              <OptimizedImage
                image={slides[2].image}
                className="object-cover w-full h-full"
                size="small"
              />
            </div>
            <div
              className="font-josefin-sans font-medium text-[#574f0e] whitespace-pre-line"
              style={{
                marginLeft: vw(33),
                width: vw(482),
                fontSize: vw(28),
                lineHeight: 1.28,
              }}
            >
              {formatQuotedText(slides[2].description, isMobile)}
            </div>
          </div>
        )}

        {/* 4. Bottom Logo Image */}
        {logoImage && (
          <div
            className="absolute"
            style={{
              bottom: vw(0),
              width: vw(2166),
              height: vw(338),
              zIndex: 10,
            }}
          >
            <OptimizedImage
              image={logoImage}
              className="object-contain w-full h-full"
              size="small"
            />
          </div>
        )}
      </div>
    </section>
  );
}
