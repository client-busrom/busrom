"use client";

import type { HomeContent } from "@/lib/content-data";
import Image from "next/image";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Props = {
  data: HomeContent["oemOdm"];
};

/**
 * OEM/ODM Section
 *
 * Desktop (md+): 左右分割布局，闪电标分割
 * Mobile: 上下堆叠布局，OEM 在上，ODM 在下，闪电标居中显示
 */
export default function OemOdm({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  if (!data || !data.oem || !data.odm) {
    return null;
  }

  const { oem: OEM, odm: ODM } = data;

  // clip-path for desktop diagonal split
  // 左侧：右边斜切
  const clipPathLeft = "polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)";
  // 右侧：左边斜切
  const clipPathRight = "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)";

  // 动画配置
  const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const;

  const bgLeftVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: easeOutQuad },
    },
  };

  const bgRightVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: easeOutQuad },
    },
  };

  // 移动端背景动画 - 从上/下滑入
  const bgTopVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: easeOutQuad },
    },
  };

  const bgBottomVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
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

  // 移动端内容动画
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
      className="relative bg-[#1a1a1a] text-white overflow-hidden"
      data-header-theme="light"
    >
      {/* ==================== Desktop Layout (md+) ==================== */}
      <div
        className="hidden md:block relative"
        style={{ height: "clamp(400px, 51.5vw, 988px)" }}
      >
        {/* OEM 背景图片 (左侧) - 按实际图片尺寸 1106x988 */}
        <motion.div
          className="absolute inset-y-0 left-0 z-[1]"
          style={{
            width: "57.6%", // 1106 / 1920
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
          {/* 轻微遮罩增加文字可读性 */}
          <div className="absolute inset-0 bg-black/30 z-[1]" />
        </motion.div>

        {/* ODM 背景图片 (右侧) - 按实际图片尺寸 1034x988 */}
        <motion.div
          className="absolute inset-y-0 right-0 z-[2]"
          style={{
            width: "53.8%", // 1034 / 1920
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
          {/* 轻微遮罩增加文字可读性 */}
          <div className="absolute inset-0 bg-black/30 z-[1]" />
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
            className="absolute text-white text-right group cursor-pointer"
            style={{
              right: "61%",
              top: "21%",
              width: "clamp(180px, 23.8vw, 457px)",
              fontSize: "clamp(11px, 1.15vw, 22px)",
              lineHeight: "1.35",
            }}
            variants={contentLeftVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <p className="transition-opacity duration-300 group-hover:opacity-0">
              {OEM.description[0]}
            </p>
            {OEM.description[1] && (
              <p className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {OEM.description[1]}
              </p>
            )}
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
            className="absolute text-white text-left"
            style={{
              left: "69.2%",
              top: "79%",
              width: "clamp(170px, 22.4vw, 431px)",
              fontSize: "clamp(12px, 1.25vw, 24px)",
              lineHeight: "1.35",
            }}
            variants={contentRightVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {ODM.description.map((paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ==================== Mobile Layout ==================== */}
      <div className="md:hidden relative">
        {/* OEM 区块 */}
        <motion.div
          className="relative min-h-[50vh]"
          variants={bgTopVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* OEM 背景图片 - 在深色背景上方 */}
          <div className="absolute inset-0 z-[1]">
            <OptimizedImage
              image={OEM.bgImage}
              alt={OEM.bgImage?.altText || "OEM Background"}
              size="small"
              className="object-cover absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-black/30 z-[1]" />
          </div>

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
            {/* 移动端显示两段文案 */}
            <div className="text-sm leading-relaxed mb-6 opacity-90 space-y-3">
              <p>{OEM.description[0]}</p>
              {OEM.description[1] && <p>{OEM.description[1]}</p>}
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
        </motion.div>

        {/* ODM 区块 */}
        <motion.div
          className="relative min-h-[50vh]"
          variants={bgBottomVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* ODM 背景图片 - 在深色背景上方 */}
          <div className="absolute inset-0 z-[1]">
            <OptimizedImage
              image={ODM.bgImage}
              alt={ODM.bgImage?.altText || "ODM Background"}
              size="small"
              className="object-cover absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-black/30 z-[1]" />
          </div>

          {/* ODM 内容 */}
          <motion.div
            className="relative z-10 px-6 py-8 flex flex-col"
            variants={contentBottomVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* ODM 文字 - 居右对齐，确保不溢出 */}
            <div className="text-right mb-6 w-full">
              <h2 className="text-5xl font-extrabold font-anaheim mb-4">
                {ODM.title}
              </h2>
              <div className="text-sm leading-relaxed opacity-90 space-y-3">
                {ODM.description.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            {/* ODM 产品图片 - 居中，和 OEM 完全一样的尺寸 */}
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
        </motion.div>
      </div>
    </section>
  );
}
