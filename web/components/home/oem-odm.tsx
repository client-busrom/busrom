"use client";

import type { HomeContent } from "@/lib/content-data";
import Image from "next/image";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  data: HomeContent["oemOdm"];
  headerTheme?: string;
  className?: string;
};

/**
 * OEM/ODM Section
 *
 * Desktop (md+): 左右分割布局，闪电标分割
 * Mobile: 上下堆叠布局，OEM 在上，ODM 在下，闪电标居中显示
 */
export default function OemOdm({ data, headerTheme, className }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  if (!data || !data.oem || !data.odm) {
    return null;
  }

  const { oem: OEM, odm: ODM } = data;

  // clip-path for desktop diagonal split
  const clipPathLeft = "polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)";
  const clipPathRight = "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)";

  // 动画配置
  const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const;

  const bgLeftVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 0.6,
      filter: "blur(2.3px)",
      transition: { duration: 0.6, ease: easeOutQuad },
    },
  };

  const bgRightVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 0.6,
      filter: "blur(2.3px)",
      transition: { duration: 0.6, ease: easeOutQuad },
    },
  };

  const bgTopVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 0.6,
      filter: "blur(2.3px)",
      transition: { duration: 0.6, ease: easeOutQuad },
    },
  };

  const bgBottomVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 0.6,
      filter: "blur(2.3px)",
      transition: { duration: 0.6, ease: easeOutQuad },
    },
  };

  const lightningVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.4, duration: 0.3, ease: "easeOut" as const },
    },
  };

  const lightningShake = {
    hidden: { x: 0 },
    visible: {
      x: [0, -3, 3, -2, 2, 0],
      transition: { delay: 0.5, duration: 0.3, ease: "easeInOut" as const },
    },
  };

  const contentLeftVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.6, duration: 0.5, ease: "easeOut" as const },
    },
  };

  const contentRightVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.7, duration: 0.5, ease: "easeOut" as const },
    },
  };

  const contentTopVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.6, duration: 0.5, ease: "easeOut" as const },
    },
  };

  const contentBottomVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.7, duration: 0.5, ease: "easeOut" as const },
    },
  };

  const imageLeftVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { delay: 0.8, duration: 0.5, ease: "easeOut" as const },
    },
  };

  const imageRightVariants = {
    hidden: { opacity: 0, scale: 0.8, x: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { delay: 0.9, duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative bg-[#000000] text-white overflow-hidden",
        className,
      )}
      data-header-theme={headerTheme}
    >
      {/* ==================== Desktop Layout (md+) ==================== */}
      <div
        className="hidden md:block relative"
        style={{ height: "clamp(400px, 51.5vw, 988px)" }}
      >
        {/* OEM 背景图片 (左侧) */}
        <motion.div
          className="absolute inset-y-0 left-0 z-[1]"
          style={{
            width: "57.6%",
            clipPath: clipPathLeft,
          }}
          variants={bgLeftVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <OptimizedImage
            image={OEM.bgImage}
            alt={OEM.bgImage?.altText || "OEM Background"}
            size="large"
            className="object-cover absolute inset-0 w-full h-full"
          />
        </motion.div>

        {/* ODM 背景图片 (右侧) */}
        <motion.div
          className="absolute inset-y-0 right-0 z-[2]"
          style={{
            width: "53.8%",
            clipPath: clipPathRight,
          }}
          variants={bgRightVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <OptimizedImage
            image={ODM.bgImage}
            alt={ODM.bgImage?.altText || "ODM Background"}
            size="large"
            className="object-cover absolute inset-0 w-full h-full"
          />
        </motion.div>

        {/* 闪电分割线 */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          variants={lightningVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div
            className="h-full flex items-center justify-center"
            variants={lightningShake}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <Image
              src="/BusromLightning.svg"
              alt="Background Split"
              width={1920}
              height={1080}
              className="h-full w-auto object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Desktop 内容层 */}
        <div className="relative z-30 w-full h-full">
          {/* OEM 标题 */}
          <motion.h2
            className="absolute font-extrabold font-anaheim text-white"
            style={{
              right: "61%",
              top: "2.6%",
              fontSize: "clamp(48px, 6.67vw, 128px)",
              lineHeight: "1.4",
            }}
            variants={contentLeftVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {OEM.title}
          </motion.h2>

          {/* OEM 描述文字 */}
          <motion.div
            className="absolute text-white text-right overflow-y-auto"
            data-lenis-prevent
            style={{
              right: "61%",
              top: "21%",
              width: "clamp(180px, 23.8vw, 457px)",
              fontSize: "clamp(11px, 1.15vw, 22px)",
              lineHeight: "1.35",
              maxHeight: "calc(clamp(11px, 1.15vw, 22px) * 1.35 * 5)",
              overscrollBehavior: "contain",
              msOverflowStyle: "scrollbar",
            }}
            variants={contentLeftVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {OEM.description.map((paragraph, index) => (
              <p key={index} className="flex items-start mr-2 justify-end">
                <span>{paragraph}</span>
                {/* <span className="w-1.5 h-1.5 rounded-full bg-white mt-[0.55em] ml-2 flex-shrink-0" /> */}
              </p>
            ))}
          </motion.div>

          {/* OEM 产品图片 */}
          <motion.div
            className="absolute rounded-[30px] overflow-hidden"
            style={{
              left: "10.6%",
              top: "50%",
              width: "clamp(160px, 22.6vw, 434px)",
              aspectRatio: "434 / 396",
              border: "7px solid #FFFAD3",
            }}
            variants={imageLeftVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <OptimizedImage
              image={OEM.image}
              alt={OEM.image?.altText || OEM.title}
              size="small"
              className="object-cover w-full h-full"
            />
          </motion.div>

          {/* ODM 产品图片 */}
          <motion.div
            className="absolute rounded-[30px] overflow-hidden"
            style={{
              left: "67.1%",
              top: "9.3%",
              width: "clamp(160px, 22.6vw, 434px)",
              aspectRatio: "434 / 396",
              border: "7px solid #FFFAD3",
            }}
            variants={imageRightVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <OptimizedImage
              image={ODM.image}
              alt={ODM.image?.altText || ODM.title}
              size="small"
              className="object-cover w-full h-full"
            />
          </motion.div>

          {/* ODM 标题 */}
          <motion.h2
            className="absolute font-extrabold font-anaheim text-white"
            style={{
              left: "68.6%",
              top: "62%",
              fontSize: "clamp(48px, 6.67vw, 128px)",
              lineHeight: "1.4",
            }}
            variants={contentRightVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {ODM.title}
          </motion.h2>

          {/* ODM 描述文字 */}
          <motion.div
            className="absolute text-white text-left overflow-y-auto"
            data-lenis-prevent
            style={{
              left: "69.2%",
              top: "79%",
              width: "clamp(170px, 22.4vw, 431px)",
              fontSize: "clamp(12px, 1.25vw, 24px)",
              lineHeight: "1.35",
              maxHeight: "calc(clamp(12px, 1.25vw, 24px) * 1.35 * 4)",
              overscrollBehavior: "contain",
              msOverflowStyle: "scrollbar",
            }}
            variants={contentRightVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {ODM.description.map((paragraph, index) => (
              <p key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-[0.55em] mr-2 flex-shrink-0" />
                <span>{paragraph}</span>
              </p>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ==================== Mobile Layout ==================== */}
      <div className="md:hidden relative">
        {/* OEM 区块 */}
        <div className="relative min-h-[50vh]">
          {/* OEM 背景图片 */}
          <motion.div
            className="absolute inset-0 z-[1]"
            variants={bgTopVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <OptimizedImage
              image={OEM.bgImage}
              alt={OEM.bgImage?.altText || "OEM Background"}
              size="small"
              className="object-cover absolute inset-0 w-full h-full"
            />
          </motion.div>

          {/* OEM 内容 */}
          <motion.div
            className="relative z-10 px-6 py-8 flex flex-col"
            variants={contentTopVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <h2 className="text-5xl font-extrabold font-anaheim mb-4">
              {OEM.title}
            </h2>
            <div className="text-sm leading-relaxed mb-6 opacity-90 space-y-3">
              <p className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-[0.5em] mr-2 flex-shrink-0" />
                <span>{OEM.description[0]}</span>
              </p>
              {OEM.description[1] && (
                <p className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-[0.5em] mr-2 flex-shrink-0" />
                  <span>{OEM.description[1]}</span>
                </p>
              )}
            </div>
            {/* OEM 产品图片 */}
            <div
              className="rounded-2xl overflow-hidden mx-auto w-[70%]"
              style={{
                aspectRatio: "434 / 396",
                border: "5px solid #FFFAD3",
              }}
            >
              <OptimizedImage
                image={OEM.image}
                alt={OEM.image?.altText || OEM.title}
                size="thumbnail"
                className="object-cover w-full h-full"
              />
            </div>
          </motion.div>
        </div>

        {/* ODM 区块 */}
        <div className="relative min-h-[50vh]">
          {/* ODM 背景图片 */}
          <motion.div
            className="absolute inset-0 z-[1]"
            variants={bgBottomVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <OptimizedImage
              image={ODM.bgImage}
              alt={ODM.bgImage?.altText || "ODM Background"}
              size="small"
              className="object-cover absolute inset-0 w-full h-full"
            />
          </motion.div>

          {/* ODM 内容 */}
          <motion.div
            className="relative z-10 px-6 py-8 flex flex-col"
            variants={contentBottomVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="text-right mb-6 w-full">
              <h2 className="text-5xl font-extrabold font-anaheim mb-4">
                {ODM.title}
              </h2>
              <div className="text-sm leading-relaxed opacity-90 space-y-3">
                {ODM.description.map((paragraph, index) => (
                  <p key={index} className="flex items-start justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-[0.5em] mr-2 flex-shrink-0" />
                    <span>{paragraph}</span>
                  </p>
                ))}
              </div>
            </div>
            {/* ODM 产品图片 */}
            <div
              className="rounded-2xl overflow-hidden mx-auto w-[70%]"
              style={{
                aspectRatio: "434 / 396",
                border: "5px solid #FFFAD3",
              }}
            >
              <OptimizedImage
                image={ODM.image}
                alt={ODM.image?.altText || ODM.title}
                size="thumbnail"
                className="object-cover w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
