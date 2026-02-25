"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

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
        <div className="absolute flex items-start justify-center text-center" style={{ left: vw(521), top: vw(0), width: vw(878), height: vw(348) }}>
          <h2 
            className="text-black font-normal" 
            style={{ 
              fontSize: vw(70), 
              lineHeight: vw(87),
              fontFamily: 'Fredericka the Great, serif',
              textShadow: '0 0 1px #000'
            }}
          >
            {mainQuote}
          </h2>
        </div>

        {/* Left Quote - Amiri Quran */}
        <div className="absolute" style={{ left: vw(155), top: vw(152), width: vw(305), height: vw(215) }}>
          <p 
            className="text-black" 
            style={{ 
              fontSize: vw(30), 
              lineHeight: vw(43),
              fontFamily: 'Amiri Quran, serif'
            }}
          >
            {leftQuote}
          </p>
        </div>

        {/* Right Quote - Amiri Quran (Scaled position) */}
        <div className="absolute" style={{ left: vw(1539), top: vw(64), width: vw(203), height: vw(210) }}>
          <p 
            className="text-black" 
            style={{ 
              fontSize: vw(24), 
              lineHeight: vw(35),
              fontFamily: 'Amiri Quran, serif'
            }}
          >
            {rightQuote}
          </p>
        </div>

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
        <div className="absolute overflow-hidden" style={{ left: vw(1516), top: vw(0), width: vw(241), height: vw(347), border: '1px solid black', borderRadius: vw(184) }}>
          <Image src={workImage} alt="Work" fill className="object-cover" unoptimized />
        </div>

        {/* Rectangle 430 - Center large engineer image */}
        <div className="absolute overflow-hidden" style={{ left: vw(779), top: vw(453), width: vw(368), height: vw(459), border: '1px solid black', borderRadius: vw(184) }}>
          <Image src={engineerImage} alt="Engineer" fill className="object-cover" unoptimized />
        </div>

        {/* Explore More Button - Ellipse 96 */}
        <Link href={ctaHref}>
          <div className="absolute flex items-center justify-center group cursor-pointer" style={{ left: vw(1013), top: vw(442), width: vw(165), height: vw(165) }}>
            <div className="absolute inset-0 bg-black rounded-full transition-transform group-hover:scale-110" />
            <div className="relative flex flex-col items-center text-white" style={{ fontFamily: 'Jomolhari, serif' }}>
              <span style={{ fontSize: vw(20), lineHeight: vw(24), textAlign: 'left', whiteSpace: 'pre-line' }}>{ctaText}</span>
              {/* Arrow Vector */}
              <div 
                className="mt-2 transition-transform group-hover:translate-x-1" 
                style={{ width: vw(90), height: vw(18) }}
              >
                <svg viewBox="0 0 90 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.833008 9H89.1664M89.1664 9L80.833 1.5M89.1664 9L80.833 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
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
        {/* Group 251 (Top Left) */}
        <div className="absolute" style={{ left: vw(153), top: vw(112), width: vw(61), height: vw(24) }}>
           <Image src="/images/application/Group 251.svg" alt="vector" fill className="object-contain" unoptimized />
        </div>

        {/* Group 252 (Mid Left) */}
        <div className="absolute" style={{ left: vw(509), top: vw(391), width: vw(82), height: vw(81) }}>
           <Image src="/images/application/Group 252.svg" alt="vector" fill className="object-contain" unoptimized />
        </div>

        {/* Group 253 (Mid Right) */}
        <div className="absolute" style={{ left: vw(1334), top: vw(450), width: vw(76), height: vw(64) }}>
           <Image src="/images/application/Group 253.svg" alt="vector" fill className="object-contain" unoptimized />
        </div>

        {/* Group 246 (Bottom Center near Said) */}
        <div className="absolute" style={{ left: vw(917), top: vw(829), width: vw(86), height: vw(16) }}>
           <Image src="/images/application/Group 246.svg" alt="vector" fill className="object-contain" unoptimized />
        </div>

      </div>
    </section>
  )
}
