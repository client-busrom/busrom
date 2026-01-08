"use client"

import React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
}

interface SimpleCtaSectionProps {
  locale: string
  title?: string
  description?: string
  ctaText?: string
  buttonText?: string
  buttonLink?: string
  images?: MediaObject[]
}

// Design constants
const DESIGN_WIDTH = 1920

export function SimpleCtaSection({
  locale,
  title = "Transform Ideas into Reality",
  description = "Busrom's business scope covers 100+ countries, not only has the ability to do private service for our wholesalers and dealers but also offers bespoke plans for designers, builders, and homeowners.",
  ctaText = "Talk to Our Specialists for Tailored Solutions.",
  buttonText = "Get Started",
  buttonLink = "/contact",
  images = [],
}: SimpleCtaSectionProps) {
  // vw conversion function
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

  // Embla carousel for mobile images
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  })

  return (
    <section className="relative w-full bg-background">
      {/* ==================== Mobile Layout ==================== */}
      <div className="lg:hidden px-6 py-6">
        {/* Gradient Background */}
        <div
          className="relative rounded-[24px] px-5 py-6 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #756F3F 0%, #968D45 100%)",
          }}
        >
          {/* Title */}
          <h2
            className="font-anaheim font-extrabold text-[24px] leading-[32px] mb-3"
            style={{ color: "#FFF180" }}
          >
            {title}
          </h2>

          {/* Description */}
          <p className="font-anaheim font-medium text-[13px] leading-[20px] text-white mb-3">
            {description}
          </p>

          {/* CTA Text */}
          <p
            className="font-anaheim font-extrabold text-[16px] leading-[24px] mb-5"
            style={{ color: "#FFEB4E" }}
          >
            {ctaText}
          </p>

          {/* Button */}
          <Link
            href={`/${locale}${buttonLink}`}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full transition-transform hover:scale-105"
            style={{ backgroundColor: "#FFF7B3" }}
          >
            <span
              className="font-anaheim font-semibold text-[14px]"
              style={{ color: "#625D2F" }}
            >
              {buttonText}
            </span>
          </Link>

          {/* Images - Draggable carousel on mobile */}
          {images.length > 0 && (
            <div className="mt-5 -mx-5 overflow-hidden" ref={emblaRef}>
              <div className="flex gap-2.5 px-5">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[160px] h-[120px] rounded-[16px] overflow-hidden bg-[#D9D9D9]"
                    style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" }}
                  >
                    <OptimizedImage
                      image={image as any}
                      alt={`CTA Image ${index + 1}`}
                      size="small"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== Desktop Layout (vw scaling) ==================== */}
      <div
        className="hidden lg:block relative"
        style={{
          height: vw(922),
        }}
      >
        {/* Gradient Background */}
        <div
          className="absolute"
          style={{
            left: vw(114),
            top: 0,
            width: vw(1672),
            height: vw(701),
            borderRadius: vw(100),
            background: "linear-gradient(180deg, #756F3F 0%, #968D45 100%)",
          }}
        />

        {/* Title with stroke effect */}
        <div
          className="absolute"
          style={{
            left: vw(186),
            top: vw(96),
          }}
        >
          {/* Shadow/stroke layer */}
          <span
            className="absolute font-anaheim font-extrabold whitespace-nowrap"
            style={{
              left: vw(3),
              top: vw(4),
              lineHeight: vw(98),
              color: "transparent",
              WebkitTextStroke: `${vw(2)} #FFFAD0`,
            }}
          >
            {title.split(' ').slice(0, -1).map((word, i) => (
              <span key={i} style={{ fontSize: vw(50) }}>{word} </span>
            ))}
            <span style={{ fontSize: vw(60) }}>{title.split(' ').slice(-1)[0]}</span>
          </span>
          {/* Main text layer */}
          <h2
            className="relative font-anaheim font-extrabold whitespace-nowrap"
            style={{
              lineHeight: vw(98),
              color: "#FFF180",
            }}
          >
            {title.split(' ').slice(0, -1).map((word, i) => (
              <span key={i} style={{ fontSize: vw(50) }}>{word} </span>
            ))}
            <span style={{ fontSize: vw(60) }}>{title.split(' ').slice(-1)[0]}</span>
          </h2>
        </div>

        {/* Description text */}
        <p
          className="absolute font-anaheim font-medium text-white"
          style={{
            left: vw(186),
            top: vw(201),
            width: vw(683),
            fontSize: vw(22),
            lineHeight: vw(34),
          }}
        >
          {description}
        </p>

        {/* CTA text */}
        <p
          className="absolute font-anaheim font-extrabold"
          style={{
            left: vw(291),
            top: vw(396),
            width: vw(503),
            fontSize: vw(32),
            lineHeight: vw(42),
            color: "#FFEB4E",
          }}
        >
          {ctaText}
        </p>

        {/* Get Started Button */}
        <Link
          href={`/${locale}${buttonLink}`}
          className="absolute flex items-center justify-center transition-transform hover:scale-105"
          style={{
            left: vw(305),
            top: vw(516),
            width: vw(325),
            height: vw(67),
            borderRadius: vw(33.5),
            backgroundColor: "#FFF7B3",
          }}
        >
          <span
            className="font-anaheim font-semibold"
            style={{
              fontSize: vw(32),
              lineHeight: vw(46),
              color: "#625D2F",
            }}
          >
            {buttonText}
          </span>
        </Link>

        {/* Decorative Arrow SVG - points from CTA text to button */}
        <svg
          className="absolute"
          style={{
            left: vw(620),
            top: vw(450),
            width: vw(81),
            height: vw(61),
          }}
          viewBox="0 0 47 86"
          fill="none"
        >
          <path
            d="M46.8929 77.8431L7.43987 85.283L1.92092e-05 45.83L13.398 54.9766C40.8378 14.7828 26.377 5.74071e-06 26.377 5.74071e-06C26.377 5.74071e-06 60.9347 28.5027 33.4949 68.6965L46.8929 77.8431Z"
            fill="url(#paint0_linear_cta)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_cta"
              x1="5.76513"
              y1="84.1397"
              x2="51.4982"
              y2="17.1499"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFEC58" />
              <stop offset="1" stopColor="#99904C" />
            </linearGradient>
          </defs>
        </svg>

        {/* Right side images - stacked */}
        {/* Image 1 - Top right */}
        <div
          className="absolute overflow-hidden bg-[#D9D9D9]"
          style={{
            left: vw(995),
            top: vw(148),
            width: vw(497),
            height: vw(274),
            borderRadius: vw(42),
            boxShadow: "0px 4px 24.4px rgba(0, 0, 0, 0.25)",
          }}
        >
          {images[0] ? (
            <OptimizedImage
              image={images[0] as any}
              alt="CTA Image 1"
              size="medium"
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        {/* Image 2 - Bottom right (largest) */}
        <div
          className="absolute overflow-hidden bg-[#D9D9D9]"
          style={{
            left: vw(1323),
            top: vw(322),
            width: vw(527),
            height: vw(476),
            borderRadius: vw(42),
            boxShadow: "0px 4px 24.4px rgba(0, 0, 0, 0.25)",
          }}
        >
          {images[1] ? (
            <OptimizedImage
              image={images[1] as any}
              alt="CTA Image 2"
              size="medium"
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        {/* Image 3 - Bottom left of the image group */}
        <div
          className="absolute overflow-hidden bg-[#D9D9D9]"
          style={{
            left: vw(1076),
            top: vw(476),
            width: vw(336),
            height: vw(410),
            borderRadius: vw(42),
            boxShadow: "0px 4px 24.4px rgba(0, 0, 0, 0.25)",
          }}
        >
          {images[2] ? (
            <OptimizedImage
              image={images[2] as any}
              alt="CTA Image 3"
              size="medium"
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
