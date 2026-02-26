"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

function vw(px: number) {
  return `${(px / 1920) * 100}vw`
}

interface ApplicationEngineerSaidSectionProps {
  mainQuote?: string
  leftQuote?: string
  rightQuote?: string
  ctaText?: string
  ctaHref?: string
  engineerImage?: string
  workImage?: string
}

export function ApplicationEngineerSaidSection({
  mainQuote = "For Busrom, design is never mere fantasy, but a precise balance of mechanics and aesthetics.",
  leftQuote = "Through a rigorous manufacturing system, Busrom transforms abstract concepts into tangible works of art.",
  rightQuote = "Every adjustment in craftsmanship and every dimension controlled embodies our pursuit of ultimate reliability.",
  ctaText = "Explore\nMore",
  ctaHref = "/about",
  engineerImage = "/images/application/engineer.jpg",
  workImage = "/images/application/work.jpg"
}: ApplicationEngineerSaidSectionProps) {
  return (
    <section className="relative w-full select-none" style={{ height: vw(912 + 100) }}>
      {/* 1920 Container for absolute positioning */}
      <div className="absolute left-1/2 -translate-x-1/2 h-full" style={{ width: vw(1920) }}>
        
        {/* Main Quote - Fredericka the Great (Center Top) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute flex items-start justify-center text-center" 
          style={{ left: vw(521), top: vw(0), width: vw(878), height: vw(348) }}
        >
          <h2 
            className="text-black font-normal" 
            style={{ 
              fontSize: vw(70), 
              lineHeight: vw(87),
              fontFamily: 'var(--font-fredericka), "Fredericka the Great", serif',
              textShadow: '0 0 1px #000'
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
          style={{ left: vw(155), top: vw(152), width: vw(305), height: vw(215) }}
        >
          <p 
            className="text-black" 
            style={{ 
              fontSize: vw(30), 
              lineHeight: vw(43),
              fontFamily: 'var(--font-amiri), serif'
            }}
          >
            {leftQuote}
          </p>
        </motion.div>

        {/* Right Quote - Amiri Quran (Scaled position) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute" 
          style={{ left: vw(1539), top: vw(64), width: vw(203), height: vw(210) }}
        >
          <p 
            className="text-black" 
            style={{ 
              fontSize: vw(24), 
              lineHeight: vw(35),
              fontFamily: 'var(--font-amiri), serif'
            }}
          >
            {rightQuote}
          </p>
        </motion.div>

        {/* Engineer Identity (Center Bottom) */}
        <div className="absolute flex flex-col items-center" style={{ left: vw(805), top: vw(626), width: vw(316) }}>
          <span 
            className="text-black" 
            style={{ 
              fontSize: vw(60), 
              lineHeight: vw(76),
              fontFamily: 'Jomhuria, sans-serif'
            }}
          >
            The engineer
          </span>
          <span 
            className="text-black" 
            style={{ 
              fontSize: vw(150), 
              lineHeight: vw(91),
              fontFamily: 'Jomhuria, sans-serif',
              marginTop: vw(-15)
            }}
          >
            said
          </span>
        </div>

        {/* Image Containers */}
        
        {/* Rectangle 431 - Top Right smaller image */}
        <motion.div 
          whileHover={{ 
            x: [0, -2, 2, -2, 2, 0],
            y: [0, 1, -1, 1, -1, 0],
            rotate: [0, -1, 1, -1, 1, 0],
            transition: { duration: 0.2, repeat: Infinity, ease: "linear" } 
          }}
          className="absolute overflow-hidden cursor-pointer" 
          style={{ left: vw(1516), top: vw(0), width: vw(241), height: vw(347), border: '1px solid black', borderRadius: vw(184), zIndex: 20 }}
        >
          <Image src={workImage} alt="Work" fill className="object-cover" unoptimized />
        </motion.div>

        {/* Rectangle 430 - Center large engineer image */}
        <motion.div 
          whileHover={{ 
            x: [0, -1, 1, -1, 1, 0],
            y: [0, 2, -2, 2, -2, 0],
            rotate: [0, 0.5, -0.5, 0.5, -0.5, 0],
            transition: { duration: 0.15, repeat: Infinity, ease: "linear" } 
          }}
          className="absolute overflow-hidden cursor-pointer" 
          style={{ left: vw(779), top: vw(453), width: vw(368), height: vw(459), border: '1px solid black', borderRadius: vw(184), zIndex: 20 }}
        >
          <Image src={engineerImage} alt="Engineer" fill className="object-cover" unoptimized />
        </motion.div>

        {/* Explore More Button — Layered Clipping Approach (Black outside, White inside) */}
        <Link
          href={ctaHref || "/about"}
          className="absolute group overflow-visible"
          style={{ left: vw(1013), top: vw(442), width: vw(165), height: vw(165) }}
        >
          {/* 1. Underlying Black Arrow (Visible only outside the black circle) */}
          <div
            className="absolute transition-all duration-300 group-hover:translate-x-2"
            style={{ 
              left: vw(-45), // Shifted left to be half-out
              top: '50%',
              transform: 'translateY(-50%)',
              width: vw(90),
              height: vw(18),
              zIndex: 1
            }}
          >
            <svg viewBox="0 0 91 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M0.833252 9H90.1666M90.1666 9L81.8333 1.5M90.1666 9L81.8333 16.5" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
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
                top: '50%',
                transform: 'translateY(-50%)',
                width: vw(90),
                height: vw(18),
              }}
            >
              <svg viewBox="0 0 91 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M0.833252 9H90.1666M90.1666 9L81.8333 1.5M90.1666 9L81.8333 16.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* "Explore More" Text (Inside circle) */}
            <span
              className="absolute text-white whitespace-pre-line block"
              style={{
                left: vw(60),
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: vw(28),
                lineHeight: vw(24),
                fontFamily: 'var(--font-anaheim), sans-serif',
              }}
            >{`Explore\nMore`}</span>
          </div>
        </Link>


        {/* Background Decorative Blobs (Boolean Operations) */}
        {/* ImageSvg1 - Left middle */}
        <div className="absolute pointer-events-none" style={{ left: vw(166), top: vw(512), width: vw(466), height: vw(365) }}>
           <Image src="/images/application/ImageSvg1.svg" alt="Decoration 1" fill className="object-contain" unoptimized />
        </div>

        {/* ImageSvg2 - Right Bottom */}
        <div className="absolute pointer-events-none" style={{ left: vw(1357), top: vw(489), width: vw(407), height: vw(417) }}>
           <Image src="/images/application/ImageSvg2.svg" alt="Decoration 2" fill className="object-contain" unoptimized />
        </div>

        {/* Floating Vectors */}

        {/* Three colored balls - top left decoration (Floating staggered animation) */}
        <div className="absolute flex gap-[6px]" style={{ left: vw(153), top: vw(80) }}>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-full shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#756F3F' }} 
          />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="rounded-full shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#DAC99E' }} 
          />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="rounded-full border border-black/10 shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#F6F4ED' }} 
          />
        </div>

        {/* Group 252 (Bottom Left Poking Arrow - pointing to left image) */}
        <motion.div 
          animate={{ x: [0, 10, 0], y: [0, -4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute" style={{ left: vw(509), top: vw(391), width: vw(82), height: vw(81) }}
        >
           <Image src="/images/application/Group 252.svg" alt="vector" fill className="object-contain" unoptimized />
        </motion.div>

        {/* Group 253 (Mid Right Swinging Lines - top-left of right image) */}
        <motion.div 
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute" style={{ transformOrigin: 'bottom right', left: vw(1334), top: vw(450), width: vw(76), height: vw(64) }}
        >
           <Image src="/images/application/Group 253.svg" alt="vector" fill className="object-contain" unoptimized />
        </motion.div>

        {/* Group 246 (Bottom Center near Said) */}
        <motion.div 
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute" style={{ left: vw(917), top: vw(829), width: vw(86), height: vw(16) }}
        >
           <Image src="/images/application/Group 246.svg" alt="vector" fill className="object-contain" unoptimized />
        </motion.div>

      </div>
    </section>
  )
}
