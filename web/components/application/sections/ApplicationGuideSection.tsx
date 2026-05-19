"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface RichTextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  linebreak?: boolean;
}

interface Props {
  title?: RichTextSegment[];
  image?: string;
  description?: RichTextSegment[];
  serviceCta?: { title: string; url: string };
  oemCta?: { title: string; url: string };
}

export function ApplicationGuideSection({
  title = [],
  image,
  description = [],
  serviceCta = { title: "Explore Our Service", url: "#" },
  oemCta = { title: "Unlock OEM / ODM", url: "#" },
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderSegments = (segments: RichTextSegment[]) => {
    return segments.map((s, i) => (
      <React.Fragment key={i}>
        {s.linebreak ? (
          <br />
        ) : (
          <span className={s.bold ? "font-bold" : ""}>{s.text}</span>
        )}
      </React.Fragment>
    ));
  };

  // Responsive vw helper
  const vw = (px: number) => `${(px / 1920) * 100}vw`;

  const ArrowIcon = ({
    className,
    style,
  }: {
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <svg
      viewBox="0 0 350 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M335 2L348 10L335 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0 10H348"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );

  const CircleArrow = ({
    className,
    style,
  }: {
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <svg
      viewBox="0 0 46 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M36 2L44 10.5L36 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 10.5H44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  const GuideButton = ({ text, url }: { text: string; url: string }) => (
    <motion.a
      href={url}
      initial="default"
      whileHover="hover"
      animate="default"
      className="group relative flex items-center justify-end overflow-hidden border border-[#756F3F]"
      style={{
        width: vw(375),
        height: vw(84),
        borderRadius: vw(90),
        paddingRight: vw(7),
      }}
    >
      {/* Background fill on hover */}
      <motion.div
        className="absolute inset-0 z-0 bg-[#756F3F]"
        variants={{
          default: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.3 }}
      />

      <span
        className="font-bold font-montserrat relative z-10 text-black"
        style={{ fontSize: vw(24), marginRight: vw(24) }}
      >
        {text}
      </span>

      <motion.div
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width: vw(70), height: vw(70) }}
        variants={{
          default: { backgroundColor: "#756F3F", color: "#BFB991" },
          hover: { backgroundColor: "#FFF2A3", color: "#444444" },
        }}
        transition={{ duration: 0.3 }}
      >
        <CircleArrow style={{ width: vw(41), height: vw(19) }} />
      </motion.div>
    </motion.a>
  );

  // --------------------------------------------------------------------------
  // LAYOUT CONFIGURATION (Adjust these values to fine-tune positions)
  // --------------------------------------------------------------------------
  const titleConfig = {
    right: "58%", // Horizontal Anchor
    translateX: 125, // Horizontal Offset from anchor (px)
    translateXInner: -72, // Horizontal Offset for Inner White Text (px)
    lineHeight: 126, // Absolute Line Height (px)
    width: 720, // Title container width (px)
  };

  const arrowConfig = {
    marginLeft: -342, // Horizontal Offset from Center (50%) (px)
    marginTop: -234, // Vertical Offset from Center (50%) (px)
    width: 147, // Button Width (px)
    height: 81, // Button Height (px)
  };
  // --------------------------------------------------------------------------

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#F9F9F5] select-none"
      style={{ height: vw(960) }}
    >
      {/* Central Integrated Composition */}
      <div className="relative w-full h-full flex justify-center items-center">
        {/* The Entire Group Wrapper centered on page 50% */}
        <div
          className="relative h-full flex items-center justify-center"
          style={{ width: vw(1170) }}
        >
          {/* 1. LAYER: LEFT TITLE (Outside - Black) */}
          <div
            className="absolute text-black flex flex-col items-start z-10 pointer-events-none"
            style={{
              top: "50%",
              right: titleConfig.right,
              transform: `translateY(-42%) translateX(${vw(titleConfig.translateX)})`,
              width: vw(titleConfig.width),
            }}
          >
            <h2
              className="font-amarante whitespace-pre-line break-keep"
              style={{
                fontSize: vw(99),
                lineHeight: vw(titleConfig.lineHeight),
              }}
            >
              {renderSegments(title)}
            </h2>
          </div>

          {/* 1b. INDEPENDENT CAPSULE BUTTON (Outside - Black) */}
          <div
            className="absolute flex items-center justify-center border border-black rounded-full z-10 pointer-events-none"
            style={{
              width: vw(arrowConfig.width),
              height: vw(arrowConfig.height),
              left: "50%",
              top: "58%",
              marginLeft: vw(arrowConfig.marginLeft),
              marginTop: vw(arrowConfig.marginTop),
            }}
          >
            <CircleArrow
              style={{ width: vw(41), height: vw(19), color: "#000" }}
            />
          </div>

          {/* 2. LAYER: MIDDLE IMAGE (Middle Layer) */}
          <div
            className="absolute overflow-hidden rounded-full z-20 shadow-2xl"
            style={{
              width: vw(562),
              height: vw(562),
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -42%)",
            }}
          >
            {image ? (
              <OptimizedImage
                image={image}
                alt="Guide"
                sizes="meidum"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}

            {/* White Content Overlay (Clipped to Circle) */}
            <div
              className="absolute text-white pointer-events-none"
              style={{
                top: "50%",
                left: vw(-304),
                width: vw(1170),
                height: "100%",
                transform: "translateY(-50%)",
              }}
            >
              {/* Replicated Title for Inversion */}
              <div
                className="absolute flex flex-col items-start text-white"
                style={{
                  top: "50%",
                  right: titleConfig.right,
                  transform: `translateY(-50%) translateX(${vw(titleConfig.translateX)})`,
                  width: vw(titleConfig.width),
                }}
              >
                <h2
                  className="font-amarante whitespace-pre-line break-keep !text-white"
                  style={{
                    fontSize: vw(99),
                    lineHeight: vw(titleConfig.lineHeight),
                  }}
                >
                  {renderSegments(title)}
                </h2>
              </div>

              {/* Replicated Button for Inversion */}
              <div
                className="absolute flex items-center justify-center border border-white rounded-full"
                style={{
                  width: vw(arrowConfig.width),
                  height: vw(arrowConfig.height),
                  left: "50%",
                  top: "55.6%",
                  marginLeft: vw(arrowConfig.marginLeft),
                  marginTop: vw(arrowConfig.marginTop),
                }}
              >
                <CircleArrow
                  style={{ width: vw(41), height: vw(19), color: "#fff" }}
                />
              </div>
            </div>
          </div>

          {/* 3. LAYER: RIGHT GREEN CIRCLE (Top Layer) */}
          <div
            className="absolute rounded-full flex flex-col justify-center items-center shadow-xl backdrop-blur-sm z-30"
            style={{
              width: vw(562),
              height: vw(562),
              left: "55%",
              top: "50%",
              transform: `translate(${vw(90)}, -42%)`,
              backgroundColor: "rgba(146, 137, 62, 0.58)",
              padding: vw(45),
              gap: vw(36),
            }}
          >
            <p
              className="text-white font-montserrat text-center leading-relaxed whitespace-pre-line"
              style={{ fontSize: vw(22) }}
            >
              {renderSegments(description)}
            </p>

            <div className="flex flex-col gap-4" style={{ gap: vw(18) }}>
              <GuideButton text={serviceCta.title} url={serviceCta.url} />
              <GuideButton text={oemCta.title} url={oemCta.url} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
