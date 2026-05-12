"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { HollowText } from "@/components/common/HollowText";

import { useScroll, useTransform } from "framer-motion";

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const items = data.items || [];

  // 视差滚动 (Scroll Parallax)
  const { scrollY } = useScroll();
  const parallaxBg = useTransform(scrollY, [0, 1000], [0, 200]);
  const parallaxMid = useTransform(scrollY, [0, 1000], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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
        left: vw(270),
        top: vw(98.8),
        width: vw(325.84),
        height: vw(407.76),
        opacity: 1,
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
        left: vw(1384.5),
        top: vw(368.2),
        width: vw(325.84),
        height: vw(407.76),
        opacity: 1,
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
            <span 
              key={i} 
              className="relative inline-block font-bold text-[#FFB039]"
              style={{
                // 3D 挤压厚度阴影
                textShadow: `
                  ${vw(1)} ${vw(1)} 0 #FFEB6B,
                  ${vw(2)} ${vw(2)} 0 #FFEB6B,
                  ${vw(3)} ${vw(3)} ${vw(4)} rgba(0,0,0,0.3)
                `,
                // 利用轻微描边增加体积感
                WebkitTextStroke: `${vw(0.5)} #FFEB6B`,
                paintOrder: "stroke fill"
              }}
            >
              {text}
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
        style={{ left: vw(1120), top: vw(632), zIndex: 30 }}
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
            paddingLeft: vw(circleSize / 2),
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
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden bg-[#0a0a05]"
      style={{ height: vw(DESIGN_HEIGHT) }}
    >
      {/* --- Premium Background Layers (Enhanced Light, Reduced Blur) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 1. Base Metallic Gradient Layer (滚动视差) */}
        <motion.div 
          style={{ 
            y: parallaxBg,
            background: `
              linear-gradient(135deg, #0f0f05 0%, #252108 50%, #0f0f05 100%),
              radial-gradient(circle at 50% 50%, rgba(255, 244, 153, 0.1) 0%, transparent 70%)
            `,
            backgroundBlendMode: "screen"
          }}
          className="absolute inset-0 opacity-60"
        />

        {/* 2. Soft Ripples Effect (柔和波纹) */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ripple-${i}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [1, 2.8], 
              opacity: [0, 0.15, 0] 
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 2.6,
              ease: "easeOut"
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
            style={{ width: "60vw", height: "60vw" }}
          />
        ))}

        {/* 3. Mouse Follow Light Flare (极速响应，消除滞后) */}
        <motion.div
          animate={{
            x: mousePos.x - 400,
            y: mousePos.y - 400,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200, restDelta: 0.001 }}
          className="absolute w-[800px] h-[800px] rounded-full pointer-events-none z-10"
          style={{
            background: "radial-gradient(circle, rgba(255, 244, 153, 0.2) 0%, rgba(255, 244, 153, 0.05) 40%, transparent 70%)",
            mixBlendMode: "screen"
          }}
        />

        {/* 4. Metallic Sweep (大幅增强扫光强度) */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] blur-3xl"
          style={{ mixBlendMode: "screen" }}
        />

        {/* 6. Parallax Background Image (还原 63% 透明度与 5px 模糊) */}
        <motion.div 
          className="relative w-full h-full"
          style={{ y: parallaxBg }}
        >
          {data.bgImage && (
            <OptimizedImage
              image={data.bgImage}
              alt="FAQ Background"
              className="w-full h-full object-cover"
              size="xlarge"
            />
          )}
          {/* 精准还原遮罩颜色与磨砂强度 */}
          <div 
            className="absolute inset-0 backdrop-blur-[3px]" 
            style={{ backgroundColor: "rgba(37, 33, 8, 0.63)" }} 
          />
        </motion.div>
      </div>

      <div className="relative z-10 w-full h-full overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Item Connections */}
          <motion.div 
            className="absolute" 
            animate={{ opacity: isBgVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ left: vw(520), top: vw(220), width: vw(377), height: vw(362), zIndex: 5 }}
          >
            <svg width="100%" height="100%" viewBox="0 0 377 362" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.38403 1.44382L375.384 359.944" stroke="url(#paint0_linear_1_1348)" strokeWidth="4"/>
              <defs>
                <linearGradient id="paint0_linear_1_1348" x1="-17.5527" y1="1.44383" x2="452.027" y2="143.547" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white"/>
                  <stop offset="0.748601" stopColor="#999999" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <motion.div 
            className="absolute" 
            animate={{ opacity: isBgVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ left: vw(1022), top: vw(360), width: vw(398), height: vw(211), zIndex: 5 }}
          >
            <svg width="100%" height="100%" viewBox="0 0 398 211" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.346191 4.14404C82.8462 -10.3557 291.346 47.6442 395.346 209.644" stroke="url(#paint0_linear_1_1347)" strokeWidth="4"/>
              <defs>
                <linearGradient id="paint0_linear_1_1347" x1="-19.6538" y1="1.99964" x2="395.346" y2="231" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white"/>
                  <stop offset="1" stopColor="#999999" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

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
                    <svg
                      className="absolute inset-0 z-10"
                      width="100%"
                      height="100%"
                      viewBox="0 0 687 887"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="685"
                        height="885"
                        rx="342.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="6 10"
                      />
                    </svg>
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
            style={{ left: vw(410), top: vw(757), width: 'auto' }}
            animate={{ y: [0, vw(-15) as any, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="relative font-paytone-one font-bold text-center leading-[1.25]"
              style={{ 
                fontSize: vw(64),
                color: "#fff499",
                // 使用暗色进行多层堆叠，营造出实心的厚度感
                textShadow: `
                  ${vw(1)} ${vw(1)} 0 #0f0e03,
                  ${vw(2)} ${vw(2)} 0 #0f0e03,
                  ${vw(3)} ${vw(3)} 0 #0f0e03,
                  ${vw(4)} ${vw(4)} 0 #0f0e03,
                  ${vw(5)} ${vw(5)} 0 #0f0e03,
                  ${vw(6)} ${vw(6)} 0 #0f0e03,
                  ${vw(8)} ${vw(8)} ${vw(12)} #FF911B
                `,
                WebkitTextStroke: `${vw(1.5)} #FF911B`,
                paintOrder: "stroke fill"
              }}
            >
              {renderRichText(data.text[0], true)}
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
