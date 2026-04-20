"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { HollowText } from "@/components/common/HollowText";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 968;

const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface FaqHeroSectionProps {
  data: {
    title: any[];
    text: any[];
    bgImage: any;
    btnText: string;
    items: any[];
    cta: any[];
    linkJump: any;
  };
  locale: string;
}

export function FaqHeroSection({ data, locale }: FaqHeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBgVisible, setIsBgVisible] = useState(true);
  const items = data.items || [];

  const handleNext = () => {
    if (items.length <= 1) return;
    setIsBgVisible(false);
    setTimeout(() => {
      setActiveIndex((prev) => prev + 1);
      setTimeout(() => {
        setIsBgVisible(true);
      }, 500);
    }, 250);
  };

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [activeIndex, items.length]);

  const displayItems = [
    {
      vIndex: activeIndex - 1,
      pos: "L",
      style: {
        left: vw(320),
        top: vw(98.8),
        width: vw(325.84),
        height: vw(407.76),
        opacity: 0.8,
        zIndex: 10,
      },
    },
    {
      vIndex: activeIndex,
      pos: "C",
      style: {
        left: vw(756.5),
        top: vw(148),
        width: vw(407.3),
        height: vw(509.7),
        opacity: 1,
        zIndex: 30,
      },
    },
    {
      vIndex: activeIndex + 1,
      pos: "R",
      style: {
        left: vw(1334.5),
        top: vw(368.2),
        width: vw(325.84),
        height: vw(407.76),
        opacity: 0.8,
        zIndex: 10,
      },
    },
  ];

  const renderRichText = (nodes: any[], isTitleLayer: boolean = false) => {
    if (!nodes) return null;
    return nodes.map((node: any, i: number) => {
      if (node.type === "text") {
        const isBold = node.format & 1;
        const text = node.text || "";
        if (isBold && !isTitleLayer) {
          return (
            <span key={i} className="relative inline-flex font-bold">
              <HollowText
                strokeColor="#FFEB6B"
                strokeWidth={0.5}
                className="relative z-0"
                style={{ top: vw(3) }}
              >
                {text}
              </HollowText>
              <span
                className="absolute inset-0 z-10 text-[#FFB039]"
                aria-hidden="true"
              >
                {text}
              </span>
            </span>
          );
        }
        return <span key={i}>{text}</span>;
      }
      if (node.type === "linebreak") return <br key={i} />;
      return null;
    });
  };

  const renderCta = () => {
    const cta = data.linkJump;
    if (!cta) return null;
    const circleSize = 73;
    const dotSize = 8;
    const fontSize = 29;
    const dotGap = 8;

    return (
      <Link
        href={cta.url || "#"}
        className="absolute flex items-center group"
        style={{ left: vw(1150), top: vw(632), zIndex: 30 }}
      >
        <div
          className="relative border-white transition-all duration-500 ease-out group-hover:opacity-0"
          style={{
            width: vw(circleSize),
            height: vw(circleSize),
            borderRadius: "50%",
            border: `${vw(2)} solid white`,
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: "orbitSpin 4s linear infinite" }}
          >
            <div style={{ animation: "orbitRadius 4s ease-in-out infinite" }}>
              <div
                className="rounded-full bg-[#FFCC4A]"
                style={{ width: vw(dotSize), height: vw(dotSize) }}
              />
            </div>
          </div>
        </div>
        <span
          className="absolute font-anaheim font-normal text-white whitespace-nowrap transition-all duration-500 group-hover:opacity-0"
          style={{ fontSize: vw(fontSize), left: vw(circleSize + dotGap) }}
        >
          {cta.title}
        </span>
        <div
          className="absolute left-0 top-0 border-white bg-white/20 backdrop-blur-sm transition-all duration-500 ease-out pointer-events-none opacity-0 group-hover:opacity-100 flex items-center"
          style={{
            height: vw(circleSize),
            borderRadius: vw(circleSize / 2),
            border: `${vw(2)} solid white`,
            paddingLeft: vw(circleSize + dotGap),
            paddingRight: vw(circleSize / 2),
          }}
        >
          <span
            className="font-anaheim font-normal text-white whitespace-nowrap"
            style={{ fontSize: vw(fontSize) }}
          >
            {cta.title}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#252108]"
      style={{ height: vw(DESIGN_HEIGHT) }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {data.bgImage ? (
          <div className="relative w-full h-full">
            <OptimizedImage
              image={data.bgImage}
              alt="FAQ Background"
              className="w-full h-full object-cover"
              size="xlarge"
            />
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `radial-gradient(circle at ${vw(2)} ${vw(2)}, white ${vw(1)}, transparent 0)`,
                  backgroundSize: `${vw(24)} ${vw(24)}`,
                }}
              />
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.4, 0],
                    scale: [0.8, 1.2, 0.8],
                    x: [vw(Math.random() * 1920), vw(Math.random() * 1920)],
                    y: [vw(Math.random() * 968), vw(Math.random() * 968)],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 4,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                    ease: "easeInOut",
                  }}
                  className="absolute bg-white/10 blur-[80px] rounded-full"
                  style={{ width: vw(300), height: vw(300) }}
                />
              ))}
              <motion.div
                animate={{ left: ["-100%", "200%"], opacity: [0, 0.2, 0] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "linear",
                }}
                className="absolute top-0 bg-white/5 skew-x-[-35deg] blur-3xl"
                style={{ width: vw(100), height: "100%" }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-[#252108]" />
        )}
        <div className="absolute inset-0 bg-[#252108]/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full h-full overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-20">
          <AnimatePresence initial={false}>
            {displayItems.map(({ vIndex, pos, style }) => {
              const itemIndex =
                ((vIndex % items.length) + items.length) % items.length;
              const item = items[itemIndex];
              if (!item) return null;
              const isCenter = pos === "C";
              return (
                <motion.div
                  key={vIndex}
                  layoutId={`item-${vIndex}`}
                  initial={{ opacity: 0, left: vw(1800), top: vw(800) }}
                  animate={style}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute group pointer-events-auto cursor-pointer"
                >
                  <AnimatePresence>
                    {isCenter && isBgVisible && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="absolute left-0 top-0 bg-[#fffbd7]"
                        style={{
                          width: vw(407.3),
                          height: vw(245),
                          borderTopLeftRadius: vw(203),
                          borderTopRightRadius: vw(203),
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <div
                    className="relative mx-auto"
                    style={{
                      width: isCenter ? vw(394) : vw(315.2),
                      height: isCenter ? vw(509) : vw(407.2),
                      marginTop: vw(10),
                      borderRadius: vw(300),
                    }}
                  >
                    <div
                      className={`absolute inset-0 z-10`}
                      style={{
                        borderRadius: vw(300),
                        border: `${vw(2)} #ffffff dashed`,
                      }}
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        margin: isCenter ? vw(10) : vw(8),
                        borderRadius: vw(300),
                      }}
                    >
                      <OptimizedImage
                        image={item.image}
                        alt={`FAQ Item ${pos}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        size="large"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {renderCta()}

        {data.text[2] && (
          <div
            className="absolute text-white font-anaheim leading-[1.3]"
            style={{
              left: vw(1220),
              top: vw(154),
              width: vw(376),
              fontSize: vw(29),
              fontWeight: 500,
            }}
          >
            {renderRichText(data.text[2])}
          </div>
        )}
        {data.text[1] && (
          <div
            className="absolute text-white font-anaheim leading-[1.3]"
            style={{
              left: vw(320),
              top: vw(534),
              width: vw(374),
              fontSize: vw(29),
              fontWeight: 600,
            }}
          >
            {renderRichText(data.text[1])}
          </div>
        )}
        {data.text[0] && (
          <motion.div
            className="absolute"
            style={{ left: vw(410), top: vw(757), width: vw(1101) }}
            animate={{ y: [0, vw(-15) as any, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="relative font-paytone-one font-bold text-center leading-[1.25]"
              style={{ fontSize: vw(60), color: "#fff499" }}
            >
              <div
                className="absolute inset-0 select-none"
                style={{
                  color: "#0f0e03",
                  transform: `translate(${vw(3)}, ${vw(8)})`,
                  zIndex: -1,
                  WebkitTextStroke: `${vw(2)} #FF911B`,
                  paintOrder: "stroke fill",
                }}
              >
                {renderRichText(data.text[0], true)}
              </div>
              <div className="relative">
                {renderRichText(data.text[0], true)}
              </div>
            </div>
          </motion.div>
        )}

        <div
          className="absolute flex items-center justify-center z-[50] cursor-pointer"
          onClick={handleNext}
          style={{
            left: vw(896.5),
            top: vw(599),
            width: vw(127),
            height: vw(127),
          }}
        >
          <div
            className="absolute inset-0 rounded-full bg-[#433e13]"
            style={{ border: `${vw(16)} solid #fffbd7` }}
          />
          <div className="absolute inset-0 animate-spin-slow">
            <svg
              viewBox="0 0 127 127"
              className="w-full h-full overflow-visible"
            >
              <path
                id="innerCurve"
                d="M 63.5, 63.5 m -43, 0 a 43,43 0 1,0 86,0 a 43,43 0 1,0 -86,0"
                fill="transparent"
              />
              <text
                className="font-anaheim fill-white tracking-[0.4em]"
                style={{ fontSize: vw(20), fontWeight: 700 }}
              >
                <textPath href="#innerCurve" startOffset="0%">
                  {data.btnText || "CLICK TO VIEW"}
                </textPath>
              </text>
            </svg>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="rounded-full border-white flex items-start justify-center"
              style={{
                width: vw(19.5),
                height: vw(31.6),
                border: `${vw(2)} solid white`,
                padding: vw(4),
              }}
            >
              <motion.div
                animate={{ y: [0, vw(6) as any, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="bg-white rounded-full"
                style={{ width: vw(3), height: vw(8) }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes orbitSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes orbitRadius {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(50%);
          }
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
