"use client"

import React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "framer-motion"

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
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
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
const SCALE = 0.7

export function SimpleCtaSection({
  locale,
  title = "Transform Ideas into Reality",
  description = "Busrom's business scope covers 100+ countries, not only has the ability to do private service for our wholesalers and dealers but also offers bespoke plans for designers, builders, and homeowners.",
  ctaText = "Talk to Our Specialists for Tailored Solutions.",
  buttonText = "Get Started",
  buttonLink = "/contact-us",
  images = [],
}: SimpleCtaSectionProps) {
  // Layout vw: with 0.7 scale for backgrounds, images, positions
  const vw = (px: number) => `${(px * SCALE / DESIGN_WIDTH) * 100}vw`
  // Font vw: no scale, using standard font sizes (60/24/20/16)
  const fontVw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`
  // Direct pixel to vw: no scale, for exact pixel values (image sizes)
  const pxToVw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

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
          <Link href={`/${locale}${buttonLink}`} className="inline-block">
            <motion.div
              className="origin-center"
              style={{ transformOrigin: "50% 50%" }}
              initial={{ rotate: 0, scale: 1 }}
              animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
              whileHover={{
                rotate: 0,
                scale: 1.08,
                transition: { scale: { duration: 0.3, ease: "easeOut" } },
              }}
              transition={{
                rotate: {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                },
              }}
            >
              <div
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full"
                style={{ backgroundColor: "#FFF7B3" }}
              >
                <span
                  className="font-anaheim font-semibold text-[14px]"
                  style={{ color: "#625D2F" }}
                >
                  {buttonText}
                </span>
              </div>
            </motion.div>
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
                    {image.enableLink && image.linkUrl ? (
                      <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                        <OptimizedImage
                          image={image as any}
                          alt={`CTA Image ${index + 1}`}
                          size="small"
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    ) : (
                      <OptimizedImage
                        image={image as any}
                        alt={`CTA Image ${index + 1}`}
                        size="small"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== Desktop Layout (vw scaling) ==================== */}
      <div
        className="hidden lg:block relative mx-auto"
        style={{
          height: vw(922),
          width: vw(1920),
        }}
      >
        {/* Gradient Background */}
        <div
          className="absolute"
          style={{
            left: vw(114),
            top: 0,
            width: vw(1672),
            height: vw(780),
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
          {/* Shadow/background layer - solid fill with background color + stroke */}
          <span
            className="absolute font-anaheim font-extrabold whitespace-nowrap"
            style={{
              left: vw(1.5),
              top: vw(2),
              fontSize: fontVw(60),
              lineHeight: fontVw(68),
              color: "#756F3F",
              WebkitTextStroke: `2px #FFFAD0`,
              paintOrder: "stroke fill",
            }}
          >
            {title}
          </span>
          {/* Main text layer */}
          <h2
            className="relative font-anaheim font-extrabold whitespace-nowrap"
            style={{
              fontSize: fontVw(60),
              lineHeight: fontVw(68),
              color: "#FFF180",
            }}
          >
            {title}
          </h2>
        </div>

        {/* Description text */}
        <p
          className="absolute font-montserrat font-medium text-white"
          style={{
            left: vw(190),
            top: vw(210),
            width: vw(683),
            fontSize: fontVw(16),
            lineHeight: fontVw(26),
          }}
        >
          {description}
        </p>

        {/* CTA text */}
        <p
          className="absolute font-anaheim font-extrabold"
          style={{
            left: vw(291),
            top: vw(456),
            width: vw(503),
            fontSize: fontVw(24),
            lineHeight: fontVw(32),
            color: "#FFEB4E",
          }}
        >
          {ctaText}
        </p>

        {/* Get Started Button */}
        <Link href={`/${locale}${buttonLink}`} className="absolute" style={{ left: vw(305), top: vw(576) }}>
          <motion.div
            className="origin-center"
            style={{ transformOrigin: "50% 50%" }}
            initial={{ rotate: 0, scale: 1 }}
            animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
            whileHover={{
              rotate: 0,
              scale: 1.08,
              transition: { scale: { duration: 0.3, ease: "easeOut" } },
            }}
            transition={{
              rotate: {
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "linear",
              },
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: vw(325),
                height: vw(67),
                borderRadius: vw(33.5),
                backgroundColor: "#FFF7B3",
              }}
            >
              <span
                className="font-anaheim font-semibold"
                style={{
                  fontSize: fontVw(24),
                  lineHeight: fontVw(32),
                  color: "#625D2F",
                }}
              >
                {buttonText}
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Decorative Arrow SVG - points from CTA text to button with pulse animation */}
        <svg
          className="absolute animate-pulse-glow"
          style={{
            left: vw(620),
            top: vw(510),
            width: vw(81),
            height: vw(61),
          }}
          viewBox="0 0 47 86"
          fill="none"
        >
          <style>
            {`
              @keyframes pulseGlow {
                0%, 100% {
                  opacity: 1;
                  filter: drop-shadow(0 0 0px rgba(255, 236, 88, 0));
                }
                50% {
                  opacity: 0.7;
                  filter: drop-shadow(0 0 8px rgba(255, 236, 88, 0.8));
                }
              }
              .animate-pulse-glow {
                animation: pulseGlow 1.5s ease-in-out infinite;
              }
            `}
          </style>
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

        {/* Right side images - stacked, 下移60px */}
        {/* Image 1 - Top right: 348x192 */}
        <div
          className="absolute overflow-hidden bg-[#D9D9D9]"
          style={{
            left: vw(995),
            top: vw(208),
            width: pxToVw(348),
            height: pxToVw(192),
            borderRadius: vw(42),
            boxShadow: "0px 4px 24.4px rgba(0, 0, 0, 0.25)",
          }}
        >
          {images[0] ? (
            images[0].enableLink && images[0].linkUrl ? (
              <Link href={images[0].linkUrl} target={images[0].openInNewTab ? "_blank" : undefined} rel={images[0].openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={images[0] as any}
                  alt="CTA Image 1"
                  size="medium"
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={images[0] as any}
                alt="CTA Image 1"
                size="medium"
                className="w-full h-full object-cover"
              />
            )
          ) : null}
        </div>

        {/* Image 2 - Bottom right (largest): 369x333 */}
        <div
          className="absolute overflow-hidden bg-[#D9D9D9]"
          style={{
            left: vw(1323),
            top: vw(382),
            width: pxToVw(369),
            height: pxToVw(333),
            borderRadius: vw(42),
            boxShadow: "0px 4px 24.4px rgba(0, 0, 0, 0.25)",
          }}
        >
          {images[1] ? (
            images[1].enableLink && images[1].linkUrl ? (
              <Link href={images[1].linkUrl} target={images[1].openInNewTab ? "_blank" : undefined} rel={images[1].openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={images[1] as any}
                  alt="CTA Image 2"
                  size="medium"
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={images[1] as any}
                alt="CTA Image 2"
                size="medium"
                className="w-full h-full object-cover"
              />
            )
          ) : null}
        </div>

        {/* Image 3 - Bottom left of the image group: 235x287 */}
        <div
          className="absolute overflow-hidden bg-[#D9D9D9]"
          style={{
            left: vw(1076),
            top: vw(536),
            width: pxToVw(235),
            height: pxToVw(287),
            borderRadius: vw(42),
            boxShadow: "0px 4px 24.4px rgba(0, 0, 0, 0.25)",
          }}
        >
          {images[2] ? (
            images[2].enableLink && images[2].linkUrl ? (
              <Link href={images[2].linkUrl} target={images[2].openInNewTab ? "_blank" : undefined} rel={images[2].openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={images[2] as any}
                  alt="CTA Image 3"
                  size="medium"
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={images[2] as any}
                alt="CTA Image 3"
                size="medium"
                className="w-full h-full object-cover"
              />
            )
          ) : null}
        </div>
      </div>
    </section>
  )
}
