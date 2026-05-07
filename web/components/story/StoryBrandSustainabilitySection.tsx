"use client";

import React from "react";
import { motion } from "framer-motion";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface StoryBrandSustainabilitySectionProps {
  data: {
    title: string;
    description: string;
    images: { url: string }[];
    content1: string;
    content2: string;
    tips: string;
  };
}

function StaggeredBalls() {
  return (
    <div className="flex gap-[6px]">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-full shadow-sm"
        style={{ width: vw(18), height: vw(18), backgroundColor: "#756F3F" }}
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
        className="rounded-full shadow-sm"
        style={{ width: vw(18), height: vw(18), backgroundColor: "#DAC99E" }}
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
        className="rounded-full border border-black/10 shadow-sm"
        style={{ width: vw(18), height: vw(18), backgroundColor: "#F6F4ED" }}
      />
    </div>
  );
}

export function StoryBrandSustainabilitySection({
  data,
}: StoryBrandSustainabilitySectionProps) {
  const [windowWidth, setWindowWidth] = React.useState(0);
  const images = data.images || [];

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth > 0 && windowWidth < 1024;

  if (isMobile) {
    return (
      <section className="relative w-full bg-[#f6f4ed] px-6 py-12 overflow-hidden">
        {/* Mobile Header */}
        <div className="relative mb-10">
          <h2 className="font-josefin-sans font-bold text-black text-[36px] leading-[1.1] mb-6">
            {data.title}
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <StaggeredBalls />
          </div>
          <p className="font-josefin-sans font-normal text-black text-[16px] leading-[1.5]">
            {data.description}
          </p>

          {/* Animated Orbiting Star for Mobile Header */}
          <div className="absolute -right-10 -top-4 pointer-events-none opacity-60 z-0">
            <div
              className="relative"
              style={{ width: "300px", height: "130px" }}
            >
              {/* The Ellipse Border */}
              <div
                className="absolute inset-0 border border-[#C9C177]"
                style={{
                  borderRadius: "50%",
                  transform: "rotate(-22.02deg)",
                }}
              />

              {/* Orbiting Star */}
              <motion.div
                className="absolute"
                style={{
                  width: "24px",
                  height: "24px",
                  marginLeft: "-12px",
                  marginTop: "-12px",
                  zIndex: 3,
                }}
                animate={{
                  left: Array.from({ length: 61 }).map((_, i) => {
                    const t = (i / 60) * 2 * Math.PI;
                    const a = 150; // 300/2
                    const b = 65; // 130/2
                    const rot = -22.02 * (Math.PI / 180);
                    const x =
                      a * Math.cos(t) * Math.cos(rot) -
                      b * Math.sin(t) * Math.sin(rot);
                    return 150 + x;
                  }),
                  top: Array.from({ length: 61 }).map((_, i) => {
                    const t = (i / 60) * 2 * Math.PI;
                    const a = 150;
                    const b = 65;
                    const rot = -22.02 * (Math.PI / 180);
                    const y =
                      a * Math.cos(t) * Math.sin(rot) +
                      b * Math.sin(t) * Math.cos(rot);
                    return 65 + y;
                  }),
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 1000"
                  fill="none"
                >
                  <path
                    d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z"
                    fill="#C9C177"
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Content Stack */}
        <div className="flex flex-col gap-16">
          {/* Item 1 */}
          <div className="relative flex flex-col items-center">
            <div className="absolute -left-2 top-0 font-josefin-sans font-bold text-[#756f3f] opacity-10 text-[80px]">
              BUS
            </div>
            <div className="w-[280px] h-[280px] rounded-full overflow-hidden border-2 border-black/5 shadow-xl relative z-10">
              <img
                src={images[0]?.url || "/placeholder.webp"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Item 2 */}
          <div className="relative flex flex-col items-center">
            <div className="absolute -right-2 top-0 font-josefin-sans font-bold text-[#756f3f] opacity-10 text-[80px]">
              ROM
            </div>
            <div className="w-[280px] h-[280px] rounded-full overflow-hidden border-2 border-black/5 shadow-xl relative z-10">
              <img
                src={images[1]?.url || "/placeholder.webp"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {data.content1 && (
              <div className="mt-6 text-center px-4">
                <div className="flex justify-center mb-2">
                  <StaggeredBalls />
                </div>
                <p className="font-josefin-sans font-bold text-[#ff7c03] text-[18px] leading-tight">
                  {data.content1}
                </p>
              </div>
            )}
          </div>

          {/* Item 3 */}
          <div className="relative flex flex-col items-center">
            <div className="w-[280px] h-[280px] rounded-full overflow-hidden border-2 border-black/5 shadow-xl relative z-10">
              <img
                src={images[2]?.url || "/placeholder.webp"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {data.content2 && (
              <div className="mt-6 text-center px-4">
                <div className="flex justify-center mb-2">
                  <StaggeredBalls />
                </div>
                <p className="font-josefin-sans font-bold text-[#ff7c03] text-[18px] leading-tight">
                  {data.content2}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Footer Label */}
        <div className="mt-20 pt-10 border-t border-[#756F3F]/20 flex items-center justify-between">
          <span className="font-josefin-sans text-[#756F3F] text-[12px] uppercase tracking-[0.2em]">
            {data.tips || "ABOUT BUSROM"}
          </span>
          <div className="flex-1 ml-4 h-[1px] bg-[#756F3F]" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full bg-[#f6f4ed] overflow-hidden my-20"
      style={{ height: vw(922) }}
    >
      {/* Main Centered Wrapper */}
      <div className="relative w-full h-full flex justify-center items-center">
        {/* The Visual Content Box (From Title start at 120 to Label end at 1700) */}
        <div className="relative h-full" style={{ width: vw(1580) }}>
          {/* Decorative Rotating/Orbiting Group */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: vw(20),
              top: vw(100),
              width: vw(522),
              height: vw(224),
              zIndex: 1,
            }}
          >
            <div
              className="absolute inset-0 border border-[#C9C177]"
              style={{
                borderRadius: "50%",
                transform: "rotate(-22.02deg)",
              }}
            />
            <motion.div
              className="absolute"
              style={{
                width: vw(38),
                height: vw(38),
                marginLeft: vw(-19),
                marginTop: vw(-19),
                zIndex: 3,
              }}
              animate={{
                left: Array.from({ length: 61 }).map((_, i) => {
                  const t = (i / 60) * 2 * Math.PI;
                  const a = 261;
                  const b = 112;
                  const rot = -22.02 * (Math.PI / 180);
                  const x =
                    a * Math.cos(t) * Math.cos(rot) -
                    b * Math.sin(t) * Math.sin(rot);
                  return vw(261 + x);
                }),
                top: Array.from({ length: 61 }).map((_, i) => {
                  const t = (i / 60) * 2 * Math.PI;
                  const a = 261;
                  const b = 112;
                  const rot = -22.02 * (Math.PI / 180);
                  const y =
                    a * Math.cos(t) * Math.sin(rot) +
                    b * Math.sin(t) * Math.cos(rot);
                  return vw(112 + y);
                }),
                rotate: 360,
              }}
              transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1000 1000"
                fill="none"
              >
                <path
                  d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z"
                  fill="#C9C177"
                />
              </svg>
            </motion.div>
          </div>

          {/* Left Side (Content) */}
          <div className="absolute h-full" style={{ left: 0, width: vw(607) }}>
            {/* Title */}
            <div
              className="absolute"
              style={{ left: 0, top: vw(148), width: vw(481) }}
            >
              <h2
                className="font-josefin-sans font-bold text-black tracking-widest whitespace-pre-line"
                style={{ fontSize: vw(72), lineHeight: 1.1 }}
              >
                {data.title}
              </h2>
            </div>
            {/* Marker */}
            <div
              className="absolute flex items-center"
              style={{ left: 0, top: vw(427), width: vw(80), height: vw(24) }}
            >
              <StaggeredBalls />
            </div>
            {/* Description */}
            <div
              className="absolute"
              style={{ left: 0, top: vw(467), width: vw(543) }}
            >
              <p
                className="font-josefin-sans font-normal text-black whitespace-pre-line"
                style={{ fontSize: vw(24), lineHeight: 1.3 }}
              >
                {data.description}
              </p>
            </div>
          </div>

          {/* Right Side (Boxes + Circles) */}
          <div
            className="absolute flex h-full"
            style={{ left: vw(607), width: vw(1194) }}
          >
            <div
              className="relative h-full overflow-hidden"
              style={{ width: vw(391) }}
            >
              <div
                className="absolute font-josefin-sans font-bold text-[#756f3f] opacity-20 select-none z-0"
                style={{
                  left: vw(60),
                  top: vw(110),
                  fontSize: vw(160),
                  pointerEvents: "none",
                }}
              >
                BUS
              </div>
              <div
                className="absolute overflow-hidden rounded-full z-10"
                style={{
                  left: vw(26),
                  top: vw(226),
                  width: vw(600),
                  height: vw(600),
                }}
              >
                <img
                  src={images[0]?.url || "/placeholder.webp"}
                  alt="Sustainability 1"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div
              className="relative h-full overflow-hidden border-l-2 border-black"
              style={{ width: vw(361) }}
            >
              <div
                className="absolute font-josefin-sans font-bold text-[#756f3f] opacity-20 select-none z-0"
                style={{
                  left: vw(0),
                  top: vw(570),
                  fontSize: vw(160),
                  pointerEvents: "none",
                }}
              >
                ROM
              </div>
              <div
                className="absolute overflow-hidden rounded-full z-10"
                style={{
                  left: vw(-79.7),
                  top: vw(35),
                  width: vw(600),
                  height: vw(600),
                }}
              >
                <img
                  src={images[1]?.url || "/placeholder.webp"}
                  alt="Sustainability 2"
                  className="w-full h-full object-cover"
                />
              </div>
              {data.content1 && (
                <div
                  className="absolute z-20"
                  style={{ top: vw(763), left: vw(49), width: vw(240) }}
                >
                  <div className="mb-2">
                    <StaggeredBalls />
                  </div>
                  <p
                    className="font-josefin-sans font-bold text-[#ff7c03] tracking-wide whitespace-pre-line"
                    style={{ fontSize: vw(24), lineHeight: 1.2 }}
                  >
                    {data.content1}
                  </p>
                </div>
              )}
            </div>

            <div
              className="relative h-full overflow-hidden border-l-2 border-black"
              style={{ width: vw(159) }}
            >
              <div
                className="absolute overflow-hidden rounded-full z-10"
                style={{
                  left: vw(-475),
                  top: vw(330),
                  width: vw(600),
                  height: vw(600),
                }}
              >
                <img
                  src={images[2]?.url || "/placeholder.webp"}
                  alt="Sustainability 3"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {data.content2 && (
              <div
                className="absolute z-20"
                style={{ top: vw(211), left: vw(800), width: vw(200) }}
              >
                <div className="mb-4">
                  <StaggeredBalls />
                </div>
                <p
                  className="font-josefin-sans font-bold text-[#ff7c03] tracking-wide whitespace-pre-line"
                  style={{ fontSize: vw(24), lineHeight: 1.2 }}
                >
                  {data.content2}
                </p>
              </div>
            )}

            <div className="relative h-full" style={{ width: vw(283) }}>
              <div
                className="absolute flex items-center"
                style={{
                  right: vw(220),
                  bottom: vw(250),
                  width: vw(245),
                  transform: "rotate(-90deg)",
                  transformOrigin: "right center",
                }}
              >
                <span
                  className="mr-4 whitespace-nowrap font-josefin-sans uppercase tracking-[0.2em]"
                  style={{ fontSize: vw(14), color: "#756F3F" }}
                >
                  {data.tips || "ABOUT BUSROM"}
                </span>
                <div
                  className="w-[80vw] h-[2px]"
                  style={{ backgroundColor: "#756F3F" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
