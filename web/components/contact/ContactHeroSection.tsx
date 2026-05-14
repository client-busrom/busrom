"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922

// 响应式尺寸函数 - 使用 CSS 变量 --rpx-contact
// 在 globals.css 中定义，或使用与 hero 相同的逻辑
const rpx = (designValue: number) => `calc(var(--rpx-contact) * ${designValue})`

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

interface ContactHeroSectionProps {
  buttonText?: string
  buttonLink?: string
  heroImage?: MediaObject | null
  subtitle?: string
}

// Title word configurations with swing animation
// Positions from Figma design (1920x922)
const titleWords = [
  {
    src: "/contact-hero/GET.svg",
    alt: "GET",
    width: 204,
    height: 67,
    x: 211,
    y: 186,
    rotation: 0,
    delay: 0,
    duration: 4,
    amplitude: 8,
  },
  {
    src: "/contact-hero/PROFESSIONAL.svg",
    alt: "PROFESSIONAL",
    width: 628,
    height: 47,
    x: 212,
    y: 296,
    rotation: 0,
    delay: 0.3,
    duration: 5,
    amplitude: 6,
  },
  {
    src: "/contact-hero/SUPPORT.svg",
    alt: "SUPPORT",
    width: 554,
    height: 66,
    x: 189,
    y: 398,
    rotation: 3.54,
    delay: 0.6,
    duration: 4.5,
    amplitude: 7,
  },
  {
    src: "/contact-hero/AND.svg",
    alt: "&",
    width: 173,
    height: 173,
    x: 653,
    y: 359,
    rotation: 0,
    delay: 0.9,
    duration: 3.5,
    amplitude: 10,
  },
  {
    src: "/contact-hero/PROJECT.svg",
    alt: "PROJECT",
    width: 379,
    height: 47,
    x: 204,
    y: 509,
    rotation: 0,
    delay: 1.2,
    duration: 4.2,
    amplitude: 5,
  },
  {
    src: "/contact-hero/SOLUTIONS.svg",
    alt: "SOLUTIONS",
    width: 700,
    height: 71,
    x: 395,
    y: 594,
    rotation: 5.32,
    delay: 1.5,
    duration: 5.5,
    amplitude: 6,
  },
]

export function ContactHeroSection({
  buttonText = "Get A Quote",
  buttonLink = "#contact-form",
  heroImage,
  subtitle = "Contact Busrom For Technical Consultation, Product Selection, Custom Solutions And Quotations.",
}: ContactHeroSectionProps) {
  const handleScrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (buttonLink.startsWith("#")) {
      e.preventDefault()
      const targetId = buttonLink.slice(1)
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  // Calculate object position from focal point
  const objectPosition = heroImage?.cropFocalPoint
    ? `${heroImage.cropFocalPoint.x}% ${heroImage.cropFocalPoint.y}%`
    : "center"

  return (
    <section
      className="relative w-full overflow-hidden mt-[46px] h-auto md:h-[var(--section-height)]"
      style={{
        ["--section-height" as string]: rpx(DESIGN_HEIGHT),
        ["--rpx-contact" as string]: `min(calc(100vw / ${DESIGN_WIDTH}), max(calc(500px / ${DESIGN_HEIGHT}), calc((100vh - 46px) / ${DESIGN_HEIGHT})))`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #756F3F 0%, #989260 100%)",
        }}
      />

      {/* --- Desktop Layout --- */}
      <div className="hidden md:block relative w-full h-full">
      <motion.div
        className="absolute"
        style={{
          left: rpx(455),
          top: rpx(100),
          width: rpx(493),
          backgroundColor: "#B8AD52",
          transformOrigin: "top left",
          borderRadius: `${rpx(25)} 0 0 ${rpx(25)}`,
          padding: `${rpx(20)} ${rpx(30)}`,
        }}
        initial={{ opacity: 0, y: -10, rotate: -7.39 }}
        animate={{ opacity: 1, y: 0, rotate: -7.39 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <p
          className="font-josefin-sans text-white"
          style={{
            fontSize: rpx(28),
            lineHeight: rpx(39),
            textAlign: "left",
          }}
        >
          {subtitle}
        </p>
      </motion.div>

      {/* Title words with swing animation */}
      {titleWords.map((word) => (
        <motion.div
          key={word.alt}
          className="absolute"
          style={{
            left: rpx(word.x),
            top: rpx(word.y),
            width: rpx(word.width),
            height: rpx(word.height),
            transformOrigin: "top center",
          }}
          initial={{
            rotate: word.rotation - word.amplitude,
            opacity: 0,
            y: -20,
          }}
          animate={{
            rotate: [
              word.rotation - word.amplitude,
              word.rotation + word.amplitude,
              word.rotation - word.amplitude * 0.6,
              word.rotation + word.amplitude * 0.6,
              word.rotation - word.amplitude
            ],
            opacity: 1,
            y: 0,
          }}
          transition={{
            rotate: {
              duration: word.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: word.delay,
            },
            opacity: {
              duration: 0.6,
              delay: word.delay,
            },
            y: {
              duration: 0.6,
              delay: word.delay,
            },
          }}
        >
          <Image
            src={word.src}
            alt={word.alt}
            fill
            className="object-contain object-left"
            priority
          />
        </motion.div>
      ))}

      {/* Get A Quote Button */}
      <motion.a
        href={buttonLink}
        onClick={handleScrollToForm}
        className="absolute group cursor-pointer"
        style={{
          left: rpx(273),
          top: rpx(709),
          width: rpx(572),
          height: rpx(114),
          transformOrigin: "center center",
        }}
        initial={{ rotate: 1.51 }}
        animate={{ rotate: 1.51 }}
        whileHover={{
          scale: 1.02,
          x: [0, -2, 2, -2, 2, 0],
          transition: {
            x: {
              repeat: Infinity,
              duration: 0.4,
              ease: "easeInOut",
            },
          },
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* White base layer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: rpx(63),
          }}
        />
        {/* Yellow blur layer on top */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#FCE638",
            borderRadius: rpx(63),
            filter: "blur(17.9px)",
          }}
        />
        {/* Button text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-anaheim font-bold group-hover:scale-105 transition-transform"
            style={{
              fontSize: rpx(60),
              lineHeight: rpx(40),
              color: "#3D3708",
            }}
          >
            {buttonText}
          </span>
        </div>
      </motion.a>

      {/* Right side - Hero image with mask */}
      <motion.div
        className="absolute"
        style={{
          left: rpx(960),
          top: rpx(37),
          width: rpx(794),
          height: rpx(830),
          transformOrigin: "top center",
        }}
        animate={{
          rotate: [-2, 2, -1.2, 1.2, -2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Image with clip-path mask */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "url(#contact-hero-clip)",
          }}
        >
          {heroImage ? (
            heroImage.enableLink && heroImage.linkUrl ? (
              <Link href={heroImage.linkUrl} target={heroImage.openInNewTab ? "_blank" : undefined} rel={heroImage.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={heroImage as any}
                  alt="Contact hero"
                  size="large"
                  className="w-full h-full object-cover"
                  objectPosition={objectPosition}
                  priority
                />
              </Link>
            ) : (
              <OptimizedImage
                image={heroImage as any}
                alt="Contact hero"
                size="large"
                className="w-full h-full object-cover"
                objectPosition={objectPosition}
                priority
              />
            )
          ) : (
            <div className="w-full h-full bg-[#D9D9D9]" />
          )}
        </div>

      </motion.div>
    </div>


      {/* --- Mobile Layout --- */}
      <div className="block md:hidden relative w-full px-6 pt-12 pb-16 flex flex-col items-center">
        {/* Subtitle */}
        <motion.div
          className="w-full bg-[#B8AD52] rounded-xl p-5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-josefin-sans text-white text-lg leading-relaxed text-center">
            {subtitle}
          </p>
        </motion.div>

        {/* Title Images Group */}
        <div className="relative w-full max-w-[340px] aspect-[1000/500] mb-6">
          {/* 
            Title Group Bounding Box (Approx):
            Min X: 189, Max X+W: 1095 (Total Width ~906)
            Min Y: 186, Max Y+H: 665 (Total Height ~479)
            We use a 1000x500 virtual canvas for mapping
          */}
          {titleWords.map((word) => (
            <motion.div
              key={`mobile-${word.alt}`}
              className="absolute"
              style={{
                // 映射逻辑：(x - 偏移量) / 容器参考宽度
                left: `${((word.x - 150) / 950) * 100}%`,
                top: `${((word.y - 180) / 480) * 100}%`,
                width: `${(word.width / 950) * 100}%`,
                height: `${(word.height / 480) * 100}%`,
              }}
              animate={{
                rotate: [
                  word.rotation - word.amplitude,
                  word.rotation + word.amplitude,
                  word.rotation - word.amplitude
                ],
              }}
              transition={{
                duration: word.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: word.delay,
              }}
            >
              <Image
                src={word.src}
                alt={word.alt}
                fill
                className="object-contain"
              />
            </motion.div>
          ))}
        </div>

        {/* Button */}
        <motion.a
          href={buttonLink}
          onClick={handleScrollToForm}
          className="relative w-full max-w-[280px] h-[64px] mb-12 flex items-center justify-center bg-white rounded-full shadow-lg overflow-hidden"
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-[#FCE638] blur-xl opacity-60" />
          <span className="relative z-10 font-anaheim font-bold text-2xl text-[#3D3708]">
            {buttonText}
          </span>
        </motion.a>

        {/* Hero Image */}
        <div className="w-full aspect-[340/360] max-w-[340px] relative">
          <div
            className="w-full h-full"
            style={{ clipPath: "url(#contact-hero-clip)" }}
          >
            {heroImage ? (
              <OptimizedImage
                image={heroImage as any}
                alt="Contact hero"
                size="medium"
                className="w-full h-full object-cover"
                objectPosition={objectPosition}
                priority
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9]" />
            )}
          </div>
        </div>
      </div>
        {/* Hidden SVG for clip-path definition */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <clipPath id="contact-hero-clip" clipPathUnits="objectBoundingBox">
              <path
                transform="scale(0.001277, 0.001203)"
                d="M320.536 814.206L155.978 830.78C139.493 832.44 124.619 820.439 122.756 803.976L112.609 714.32C110.746 697.857 122.599 683.164 139.084 681.504L303.642 664.93L320.536 814.206ZM757.059 680.134C773.427 682.701 784.61 698.051 782.036 714.419L768.044 803.409C765.471 819.777 750.115 830.964 733.747 828.396L638.471 813.45L661.782 665.186L757.059 680.134ZM487.305 798.498L333.764 794.875L337.305 644.835L490.845 648.458L487.305 798.498ZM628.463 801.829L497.211 798.732L500.752 648.692L632.003 651.789L628.463 801.829ZM741.543 513.325C758.107 513.715 771.218 527.46 770.827 544.024L769.013 620.889C768.623 637.453 754.878 650.564 738.314 650.173L500.849 644.57L504.078 507.721L741.543 513.325ZM490.981 642.688L167.666 635.059C151.102 634.668 137.992 620.923 138.382 604.359L140.196 527.493C140.587 510.929 154.331 497.818 170.895 498.209L494.211 505.838L490.981 642.688ZM345.634 486.527L164.754 491.878C148.193 492.368 134.368 479.339 133.875 462.778L130.665 354.782C130.173 338.22 143.2 324.398 159.761 323.908L340.642 318.557L345.634 486.527ZM541.458 498.705L359.026 494.4L362.994 326.224L545.427 330.529L541.458 498.705ZM745.462 335.249C762.026 335.64 775.137 349.385 774.746 365.949L772.193 474.141C771.802 490.705 758.057 503.816 741.494 503.425L551.081 498.932L555.049 330.756L745.462 335.249ZM150.098 302.475L48.0539 319.236C31.7046 321.921 16.2677 310.846 13.5742 294.498L0.403616 214.558C-2.28972 198.21 8.7813 182.78 25.1307 180.095L127.175 163.333L150.098 302.475ZM485.44 317.565L261.732 312.287L265.059 171.315L488.766 176.594L485.44 317.565ZM647.809 180.347C664.373 180.738 677.483 194.482 677.093 211.046L675.182 292.034C674.791 308.598 661.046 321.709 644.482 321.318L489.565 317.663L492.892 176.691L647.809 180.347ZM489.038 165.053L265.331 159.774L268.658 18.8028L492.364 24.0816L489.038 165.053ZM651.409 27.8346C667.973 28.2255 681.083 41.9701 680.693 58.534L678.781 139.522C678.39 156.086 664.646 169.197 648.082 168.806L493.165 165.151L496.492 24.179L651.409 27.8346ZM92.693 26.3677C94.7046 9.92178 109.668 -1.78321 126.114 0.224016L243.237 14.5183L226.118 154.487L108.995 140.193C92.5484 138.186 80.8465 123.227 82.8578 106.781L92.693 26.3677Z"
              />
            </clipPath>
          </defs>
        </svg>
      </section>
  )
}
