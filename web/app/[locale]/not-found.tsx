"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { defaultLocale, locales } from "@/i18n.config";

export default function NotFound() {
  const pathname = usePathname();

  // Simple locale detection from pathname
  const segments = pathname.split("/");
  const pathLocale = segments[1];
  const locale = locales.includes(pathLocale as any)
    ? pathLocale
    : defaultLocale;

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="min-h-[calc(100vh-80px)] bg-[#FAF9F5] flex flex-col justify-between relative overflow-hidden font-sans pt-24"
      data-header-theme="light"
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 relative z-10">
        {/* Left Side: Text Content */}
        <div className="w-full lg:w-3/5 flex flex-col justify-center items-start lg:pr-12 xl:pr-24 h-full pb-20 lg:pb-0 z-20">
          <h1
            className="text-[32px] md:text-[40px] lg:text-[clamp(32px,2.4vw,46px)] text-[#2D2D2D] uppercase leading-[1.3] mb-12 tracking-wide"
            style={{
              fontFamily: '"Playfair Display", "Times New Roman", Times, serif',
            }}
          >
            THE PAGE YOU ARE LOOKING
            <br />
            FOR MIGHT HAVE BEEN
            <br />
            REMOVED OR TEMPORARILY
            <br />
            UNAVAILABLE
          </h1>

          <Link
            href={`/${locale}`}
            className="px-10 py-4 bg-[#BFA273] text-white font-sans font-bold text-sm tracking-[0.1em] rounded-sm hover:bg-[#A88A5C] transition-colors duration-300"
          >
            BACK TO HOME
          </Link>
        </div>

        {/* Right Side: Building Illustration */}
        <div className="w-full lg:w-2/5 flex items-end justify-end opacity-90 lg:absolute lg:right-0 lg:bottom-0 lg:h-full pointer-events-none z-10">
          <BuildingGraphic />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 pb-8 z-20 relative">
        <p className="text-[#888888] text-xs font-sans tracking-wide">
          Copyright &copy; Busrom {currentYear}. All Rights Reserved
        </p>
      </div>
    </div>
  );
}

function ErrorImageWall() {
  const [positions, setPositions] = useState<number[]>([0, 1, 2, 3, 4]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const images = [
    "/homeProductSeries/glass_clip_washroom.png",
    "/homeProductSeries/hidden_hook.png",
    "/homeProductSeries/bathroom_&_door_handle.png",
    "/homeProductSeries/glass_connected_fitting.png",
    "/homeProductSeries/glass_standoff.png",
  ];

  const DESIGN_SIZE = 800;

  const IMAGE_POSITIONS = {
    main: { x: 380, y: 350, w: 340, h: 340, zIndex: 5 },
    bg: [
      { x: 120, y: 450, w: 240, h: 240, zIndex: 4 },
      { x: 250, y: 120, w: 280, h: 280, zIndex: 3 },
      { x: 80, y: 240, w: 200, h: 200, zIndex: 2 },
      { x: 580, y: 180, w: 180, h: 180, zIndex: 1 },
    ],
  };

  const getPositionStyle = (positionIndex: number) => {
    if (positionIndex === 0) return IMAGE_POSITIONS.main;
    return IMAGE_POSITIONS.bg[positionIndex - 1] || IMAGE_POSITIONS.bg[0];
  };

  const handleImageClick = (positionIndex: number) => {
    if (positionIndex === 0) return;
    setPositions((prev) => {
      const newPositions = [...prev];
      const temp = newPositions[0];
      newPositions[0] = newPositions[positionIndex];
      newPositions[positionIndex] = temp;
      return newPositions;
    });
  };

  const springTransition = {
    type: "spring",
    stiffness: 120,
    damping: 15,
    mass: 1,
  } as const;

  return (
    <div className="relative w-full h-[500px] lg:h-full lg:w-[800px] max-w-full pointer-events-none overflow-visible lg:-translate-y-12">
      {images.map((img, imageIndex) => {
        const positionIndex = positions.indexOf(imageIndex);
        if (positionIndex === -1) return null;

        const isMain = positionIndex === 0;
        const pos = getPositionStyle(positionIndex);
        const isHovered = hoveredIndex === positionIndex;

        const animateProps: any = {
          left: `${(pos.x / DESIGN_SIZE) * 100}%`,
          top: `${(pos.y / DESIGN_SIZE) * 100}%`,
          width: `${(pos.w / DESIGN_SIZE) * 100}%`,
          height: `${(pos.h / DESIGN_SIZE) * 100}%`,
          x: "0%",
          y: "0%",
          scale: 1,
          rotate: 0,
          zIndex: pos.zIndex,
          opacity: 1,
        };

        if (hoveredIndex !== null) {
          if (isHovered) {
            animateProps.scale = 1.08;
            animateProps.zIndex = 30;
            animateProps.opacity = 1;
          } else if (isMain) {
            animateProps.x = "-5%";
            animateProps.y = "-5%";
            animateProps.scale = 0.95;
            animateProps.rotate = -3;
            animateProps.opacity = 0.9;
          } else {
            if (positionIndex === 1) {
              animateProps.x = "-3%";
              animateProps.y = "3%";
              animateProps.rotate = -2;
            } else if (positionIndex === 2) {
              animateProps.x = "4%";
              animateProps.y = "-2%";
              animateProps.rotate = 3;
            } else if (positionIndex === 3) {
              animateProps.x = "-4%";
              animateProps.y = "-4%";
              animateProps.rotate = -4;
            } else if (positionIndex === 4) {
              animateProps.x = "5%";
              animateProps.y = "2%";
              animateProps.rotate = 4;
            }
          }
        }

        return (
          <motion.div
            key={`img-${imageIndex}`}
            className="absolute bg-white rounded-[20px] lg:rounded-[30px] shadow-2xl pointer-events-auto flex items-center justify-center overflow-hidden cursor-pointer p-2 lg:p-4"
            animate={animateProps}
            transition={springTransition}
            onHoverStart={() => setHoveredIndex(positionIndex)}
            onHoverEnd={() => setHoveredIndex(null)}
            onClick={() => handleImageClick(positionIndex)}
          >
            <div className="relative w-full h-full rounded-[10px] lg:rounded-[20px] overflow-hidden bg-brand-main">
              <Image
                src={img}
                alt="Product Preview"
                fill
                sizes="(max-width: 1024px) 40vw, 20vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
