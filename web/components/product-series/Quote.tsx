"use client"

import * as React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn } from "@/lib/utils"
import type { QuoteData } from "@/lib/content-parser"

/**
 * Quote Section
 *
 * Based on Figma design:
 * - Gradient background (beige to olive)
 * - Center image
 * - Large "BUS ROM" text with arrow in the middle
 * - Two quote texts on left and right
 * - CTA button at bottom right
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 992

interface QuoteProps {
  data: QuoteData
  className?: string
}

export function Quote({ data, className }: QuoteProps) {
  if (!data) return null

  const { image = '', quoteLeft = '', quoteRight = '', ctaText = '', ctaLink = '' } = data

  return (
    <section
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #E4DDA3 0%, #756F3F 100%)",
        }}
      />

      {/* Center Image */}
      {image && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${(563 / DESIGN_WIDTH) * 100}%`,
            top: `${(65 / DESIGN_WIDTH) * 100}vw`,
            width: `${(793 / DESIGN_WIDTH) * 100}vw`,
            height: `${(927 / DESIGN_WIDTH) * 100}vw`,
            borderTopLeftRadius: '9999px',
            borderTopRightRadius: '9999px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <OptimizedImage
            image={image}
            alt=""
            size="large"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      {/* BUS ROM Logo Text */}
      <div
        className="absolute"
        style={{
          left: `${(50 / DESIGN_WIDTH) * 100}%`,
          top: `${(400 / DESIGN_WIDTH) * 100}vw`,
          width: `${(1773 / DESIGN_WIDTH) * 100}vw`,
          height: `${(222 / DESIGN_WIDTH) * 100}vw`,
        }}
      >
        <img
          src="/icons/busrom-logo-text.svg"
          alt="BUSROM"
          className="w-full h-full object-contain object-left"
        />
      </div>

      {/* Arrow in the middle of BUS ROM - with hover effect */}
      <Link
        href={ctaLink || "#"}
        className="absolute group"
        style={{
          left: `${(753 / DESIGN_WIDTH) * 100}%`,
          top: `${(480 / DESIGN_WIDTH) * 100}vw`,
          width: `${(220 / DESIGN_WIDTH) * 100}vw`,
          height: `${(59 / DESIGN_WIDTH) * 100}vw`,
        }}
      >
        {/* Default state */}
        <img
          src="/icons/arrow-pill-default.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
        />
        {/* Hover state */}
        <img
          src="/icons/arrow-pill-hover.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        />
      </Link>

      {/* Quote Left - white text at bottom left */}
      <p
        className="absolute font-josefin-sans text-white"
        style={{
          left: `${(59 / DESIGN_WIDTH) * 100}%`,
          top: `${(698 / DESIGN_WIDTH) * 100}vw`,
          width: `${(597 / DESIGN_WIDTH) * 100}vw`,
          fontSize: `${(36 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${(58 / DESIGN_WIDTH) * 100}vw`,
        }}
      >
        {quoteLeft || "Choosing Busrom Bathroom Glass Clips To Bring Professional Quality And Aesthetics To Your Project"}
      </p>

      {/* Quote Right - dark text at top right */}
      <p
        className="absolute font-josefin-sans"
        style={{
          left: `${(1369 / DESIGN_WIDTH) * 100}%`,
          top: `${(132 / DESIGN_WIDTH) * 100}vw`,
          width: `${(400 / DESIGN_WIDTH) * 100}vw`,
          fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${(58 / DESIGN_WIDTH) * 100}vw`,
          color: "#46400F",
        }}
      >
        {quoteRight || "Making Every Piece Of Glass Safe, Secure And Premium"}
      </p>

      {/* CTA Button */}
      <Link
        href={ctaLink || "#"}
        className="absolute flex items-center group overflow-hidden"
        style={{
          left: `${(1139 / DESIGN_WIDTH) * 100}%`,
          top: `${(796 / DESIGN_WIDTH) * 100}vw`,
          width: `${(463 / DESIGN_WIDTH) * 100}vw`,
          height: `${(99 / DESIGN_WIDTH) * 100}vw`,
          backgroundColor: "#FEF07D",
          borderRadius: `${(49.5 / DESIGN_WIDTH) * 100}vw`,
        }}
      >
        {/* Background expansion from icon position on hover */}
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#564E16] rounded-full transition-all duration-500 ease-out scale-0 group-hover:scale-[15]"
          style={{
            width: `${(81 / DESIGN_WIDTH) * 100}vw`,
            height: `${(81 / DESIGN_WIDTH) * 100}vw`,
            marginRight: `${(9 / DESIGN_WIDTH) * 100}vw`,
          }}
        />
        <span
          className="relative z-10 font-anaheim font-semibold text-black transition-colors duration-300 group-hover:text-white"
          style={{
            marginLeft: `${(41 / DESIGN_WIDTH) * 100}vw`,
            fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
            lineHeight: `${(49 / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          {ctaText || "Get professional quote"}
        </span>

        {/* Arrow icon - default state (filled) */}
        <img
          src="/icons/arrow-circle-hover.svg"
          alt=""
          className="absolute z-10 transition-opacity duration-300 group-hover:opacity-0"
          style={{
            right: `${(9 / DESIGN_WIDTH) * 100}vw`,
            top: `${(9 / DESIGN_WIDTH) * 100}vw`,
            width: `${(81 / DESIGN_WIDTH) * 100}vw`,
            height: `${(81 / DESIGN_WIDTH) * 100}vw`,
          }}
        />
      </Link>
    </section>
  )
}

export default Quote
