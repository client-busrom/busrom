"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function vw(px: number) {
  return `${(px / 1920) * 100}vw`;
}

interface ApplicationEngineerSaidSectionProps {
  title?: string;
  mainQuote?: string;
  leftQuote?: string;
  rightQuote?: string;
  ctaText?: string;
  ctaHref?: string;
  engineerImage?: string;
  workImage?: string;
}

export function ApplicationEngineerSaidSection({
  title = "",
  mainQuote = "",
  leftQuote = "",
  rightQuote = "",
  ctaText = "",
  ctaHref = "",
  engineerImage = "/images/application/engineer.jpg",
  workImage = "/images/application/work.jpg",
}: ApplicationEngineerSaidSectionProps) {
  return (
    <section
      className="relative w-full select-none"
      style={{ height: vw(922), marginBottom: vw(80) }}
    >
      {/* 1920 Container for absolute positioning */}
      <div
        className="absolute left-1/2 -translate-x-1/2 h-full"
        style={{ width: vw(1920) }}
      >
        {/* Scaled Content Group (80% towards visual center) */}
        <div
          className="absolute inset-0"
          style={{ transform: "scale(0.8)", transformOrigin: "center center" }}
        >
          {/* Main Quote - Fredericka the Great (Center Top) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute flex items-start justify-center text-center"
            style={{
              left: vw(521),
              top: vw(0),
              width: vw(878),
              height: vw(348),
            }}
          >
            <h2
              className="text-black font-normal"
              style={{
                fontSize: vw(70),
                lineHeight: vw(87),
                fontFamily:
                  'var(--font-fredericka), "Fredericka the Great", serif',
                textShadow: "0 0 1px #000",
              }}
            >
              {mainQuote}
            </h2>
          </motion.div>

          {/* Left Quote - Amiri Quran */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="absolute"
            style={{
              left: vw(155),
              top: vw(152),
              width: vw(305),
              height: vw(215),
            }}
          >
            <p
              className="text-black whitespace-pre-line"
              style={{
                fontSize: vw(30),
                lineHeight: vw(43),
                fontFamily: "var(--font-amiri), serif",
              }}
            >
              {leftQuote}
            </p>
          </motion.div>

          {/* 1. Right Top Stadium-Oval */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="absolute flex items-center justify-center translate-x-[-2vw]"
            style={{
              left: vw(1446),
              top: vw(0),
              width: vw(340),
              height: "auto",
              minHeight: vw(450),
              border: "0.5px solid rgba(0,0,0,0.7)",
              borderRadius: "50% / 30%",
              zIndex: 20,
              padding: `${vw(100)} ${vw(50)}`,
            }}
          >
            <p
              className="text-black text-center whitespace-pre-line"
              style={{
                fontSize: vw(26),
                lineHeight: vw(38),
                fontFamily: "var(--font-amiri), serif",
              }}
            >
              {rightQuote}
            </p>
          </motion.div>

          {/* 2. Center Bottom Stadium-Oval */}
          <div
            className="absolute flex flex-col items-center justify-center group"
            style={{
              left: vw(743),
              top: vw(450),
              width: vw(360),
              height: "auto",
              minHeight: vw(500),
              border: "3px solid rgba(0,0,0,0.7)",
              borderRadius: "100% / 50%",
              zIndex: 20,
              padding: `${vw(120)} 0`,
            }}
          >
            {/* translate-y moved to 4vw to push it even lower given larger text */}
            <div className="flex flex-col items-center translate-y-[4vw]">
              <div
                className="text-black text-center whitespace-pre-line"
                style={{
                  fontFamily: "Jomhuria, sans-serif",
                }}
              >
                <span
                  style={{
                    fontSize: vw(60),
                    lineHeight: vw(70),
                    display: "block",
                  }}
                >
                  {title.split("\n")[0]}
                </span>
                {title.includes("\n") && (
                  <span
                    style={{
                      fontSize: vw(140),
                      lineHeight: vw(110),
                      display: "block",
                      marginTop: vw(-15),
                    }}
                  >
                    {title.split("\n")[1]}
                  </span>
                )}
              </div>

              {/* Group 246 (Dots under title) */}
              <motion.div
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-[2vw] transition-all duration-300 group-hover:brightness-50 group-hover:opacity-100"
                style={{ width: vw(86), height: vw(16) }}
              >
                <Image
                  src="/images/application/Group 246.svg"
                  alt="vector"
                  width={86}
                  height={16}
                  className="object-contain"
                  unoptimized
                />
              </motion.div>
            </div>
          </div>

          {/* Explore More Button — Layered Clipping Approach (Black outside, White inside) */}
          <Link
            href={ctaHref || "/about"}
            className="absolute group overflow-visible"
            style={{
              left: vw(1013),
              top: vw(442),
              width: vw(165),
              height: vw(165),
              zIndex: 30,
            }}
          >
            {/* 1. Underlying Black Arrow (Visible only outside the black circle) */}
            <div
              className="absolute transition-all duration-300 group-hover:translate-x-2"
              style={{
                left: vw(-45), // Shifted left to be half-out
                top: "50%",
                transform: "translateY(-50%)",
                width: vw(90),
                height: vw(18),
                zIndex: 1,
              }}
            >
              <svg
                viewBox="0 0 91 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M0.833252 9H90.1666M90.1666 9L81.8333 1.5M90.1666 9L81.8333 16.5"
                  stroke="#000000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 2. The Clipped Circular "Inside" Layer */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105"
              style={{ zIndex: 2 }}
            >
              {/* Black Circle Background */}
              <div className="absolute inset-0 bg-black" />

              {/* White Arrow inside the clipped container (Same position as black arrow) */}
              <div
                className="absolute transition-all duration-300 group-hover:translate-x-2"
                style={{
                  left: vw(-45),
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: vw(90),
                  height: vw(18),
                }}
              >
                <svg
                  viewBox="0 0 91 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M0.833252 9H90.1666M90.1666 9L81.8333 1.5M90.1666 9L81.8333 16.5"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* "Explore More" Text (Inside circle) */}
              <span
                className="absolute whitespace-pre-line block"
                style={{
                  color: "#FFFFFF",
                  left: vw(65),
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: vw(24),
                  lineHeight: vw(28),
                  fontFamily: "var(--font-anaheim), sans-serif",
                }}
              >
                {ctaText}
              </span>
            </div>
          </Link>

          {/* Background Decorative Blobs (Masked Image Approach) */}
          {/* ImageSvg1 - Left middle BOTTOM - Rendering workImage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{
              y: [0, -10, 0],
              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
            animate={{ y: 0 }}
            viewport={{ once: true }}
            className="absolute overflow-hidden cursor-pointer"
            style={{
              left: vw(166),
              top: vw(512),
              width: vw(466),
              height: vw(365),
              maskImage: "url(/images/application/ImageSvg1.svg)",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              maskPosition: "center",
              WebkitMaskImage: "url(/images/application/ImageSvg1.svg)",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "center",
            }}
          >
            {workImage && (
              <Image
                src={workImage}
                alt="Work Decoration"
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </motion.div>

          {/* ImageSvg2 - Right Bottom - Rendering engineerImage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{
              y: [0, -10, 0],
              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
            animate={{ y: 0 }}
            viewport={{ once: true }}
            className="absolute overflow-hidden cursor-pointer"
            style={{
              left: vw(1357),
              top: vw(489),
              width: vw(407),
              height: vw(417),
              maskImage: "url(/images/application/ImageSvg2.svg)",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              maskPosition: "center",
              WebkitMaskImage: "url(/images/application/ImageSvg2.svg)",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "center",
            }}
          >
            {engineerImage && (
              <Image
                src={engineerImage}
                alt="Engineer Decoration"
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </motion.div>

          {/* Floating Vectors */}

          {/* Three colored balls - top left decoration (Floating staggered animation) */}
          <div
            className="absolute flex gap-[6px]"
            style={{ left: vw(153), top: vw(80) }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-full shadow-sm"
              style={{
                width: vw(18),
                height: vw(18),
                backgroundColor: "#756F3F",
              }}
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
              style={{
                width: vw(18),
                height: vw(18),
                backgroundColor: "#DAC99E",
              }}
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
              style={{
                width: vw(18),
                height: vw(18),
                backgroundColor: "#F6F4ED",
              }}
            />
          </div>

          {/* Group 252 (Bottom Left Poking Arrow - pointing to left image) */}
          <motion.div
            animate={{ x: [0, 10, 0], y: [0, -4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{
              left: vw(509),
              top: vw(391),
              width: vw(82),
              height: vw(81),
            }}
          >
            <Image
              src="/images/application/Group 252.svg"
              alt="vector"
              fill
              className="object-contain"
              unoptimized
            />
          </motion.div>

          {/* Group 253 (Mid Right Swinging Lines - top-left of right image) */}
          <motion.div
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{
              transformOrigin: "bottom right",
              left: vw(1334),
              top: vw(450),
              width: vw(76),
              height: vw(64),
            }}
          >
            <Image
              src="/images/application/Group 253.svg"
              alt="vector"
              fill
              className="object-contain"
              unoptimized
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
