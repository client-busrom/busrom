"use client"

import React from "react"
import { motion } from "framer-motion"
import { Link } from "@/lib/navigation"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface OemOdmGuideSectionProps {
  title?: string
  description?: string
  bgImage?: any
  ctaText?: string
  ctaLink?: string
  locale: string
}

export function OemOdmGuideSection({ title, description, bgImage, ctaText = "READ MORE", ctaLink = "/oem-odm", locale }: OemOdmGuideSectionProps) {
  // Figma Constants 
  const DESIGN_WIDTH = 1920
  const SECTION_HEIGHT = 875
  
  // Base scaling calculation helper
  const vw = (px: number) => `${(px * 0.7 / DESIGN_WIDTH) * 100}vw`

  return (
    <section 
      className="relative w-full overflow-hidden bg-transparent pt-8 pb-16 md:pt-12 md:pb-32"
    >
      <div className="max-w-[1920px] mx-auto w-full flex flex-col items-center">
        
        {/* 1. Large "BUSROM" SVG Masked Image Area - Proportional Scaling */}
        <div className="relative w-full max-w-[1920px] aspect-[1920/389] flex items-center justify-center">
            {bgImage ? (
                <div 
                  className="w-full h-full relative"
                  style={{
                    clipPath: "url(#busrom-clip)",
                    WebkitClipPath: "url(#busrom-clip)",
                  }}
                >
                  <OptimizedImage 
                    image={bgImage} 
                    size="large" 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                </div>
            ) : (
                <div 
                  className="w-full h-full bg-[#756F3F]"
                  style={{
                    clipPath: "url(#busrom-clip)",
                    WebkitClipPath: "url(#busrom-clip)",
                  }}
                />
            )}
            
            <svg className="absolute w-0 h-0" aria-hidden="true">
              <defs>
                <clipPath id="busrom-clip" clipPathUnits="objectBoundingBox">
                  <path
                    transform="scale(0.000520833, 0.00257069)"
                    d="M757.477 0C796.386 0 828.369 9.83234 853.424 29.4961C878.479 48.7957 891.301 77.563 891.891 115.798V122.353H800.365V120.167C800.365 109.243 797.123 100.139 790.639 92.8564C784.154 85.5737 774.279 81.9327 761.015 81.9326C748.045 81.9326 738.023 84.2994 730.948 89.0332C724.169 93.767 720.778 99.5931 720.778 106.512C720.778 116.344 725.495 123.626 734.928 128.36C744.36 133.094 759.54 138.01 780.469 143.108C804.934 149.299 824.979 155.854 840.602 162.772C856.519 169.327 870.373 180.251 882.163 195.545C893.954 210.839 899.996 231.595 900.291 257.813C900.291 302.239 888.058 335.194 863.593 356.679C839.422 378.163 806.998 388.905 766.32 388.905C718.863 388.905 681.87 379.073 655.341 359.409C629.107 339.745 615.989 304.97 615.989 255.083H708.398C708.398 274.018 712.378 286.763 720.337 293.317C728.296 299.508 740.675 302.603 757.477 302.604C769.857 302.604 780.027 300.965 787.985 297.688C796.239 294.41 800.365 287.673 800.365 277.478C800.365 268.374 795.797 261.637 786.659 257.268C777.816 252.534 763.225 247.618 742.886 242.52C718.126 235.965 697.64 229.228 681.428 222.31C665.216 215.027 651.066 203.192 638.98 186.806C626.895 170.419 620.853 148.206 620.853 120.167C620.853 79.0192 633.675 48.7956 659.319 29.4961C685.259 9.8324 717.978 6.56038e-05 757.477 0ZM1381.42 0C1433.89 0 1474.42 16.569 1503.02 49.7061C1531.61 82.843 1545.9 131.091 1545.9 194.452C1545.9 257.813 1531.61 306.062 1503.02 339.199C1474.42 372.336 1433.89 388.905 1381.42 388.905C1328.96 388.905 1288.43 372.519 1259.83 339.746C1231.54 306.609 1217.39 258.177 1217.39 194.452C1217.39 130.727 1231.54 82.4789 1259.83 49.7061C1288.43 16.569 1328.96 1.11731e-05 1381.42 0ZM401.067 229.405C401.067 250.525 405.636 267.458 414.773 280.203C423.911 292.584 437.176 298.774 454.567 298.774C471.958 298.774 485.223 292.402 494.36 279.657C503.793 266.912 508.51 250.161 508.51 229.405V6.5498H606.225V231.044C606.225 282.388 593.107 321.534 566.873 348.48C540.639 375.427 503.351 388.9 455.01 388.9C406.668 388.9 369.232 375.427 342.703 348.48C316.469 321.534 303.352 282.388 303.352 231.044V6.5498H401.067V229.405ZM202.505 6.5498C217.833 6.54987 231.834 10.5553 244.509 18.5664C257.478 26.2133 267.647 37.1375 275.017 51.3389C282.681 65.5405 286.513 81.3815 286.513 98.8604C286.513 145.106 269.564 174.237 235.666 186.254V188.439C274.28 199.364 293.587 230.68 293.587 282.389C293.587 302.052 289.608 319.531 281.649 334.825C273.986 349.755 263.374 361.407 249.814 369.782C236.255 378.158 221.369 382.346 205.157 382.346H0V6.5498H202.505ZM1096.2 6.5498C1118.01 6.54981 1136.58 11.8295 1151.91 22.3896C1167.53 32.5856 1179.18 46.6053 1186.84 64.4482C1194.8 81.9271 1198.78 101.045 1198.78 121.801C1198.78 144.742 1193.77 165.498 1183.75 184.069C1173.72 202.641 1159.13 216.297 1139.97 225.036L1207.62 382.346H1097.97L1044.03 245.246H1007.77V382.346H910.056V6.5498H1096.2ZM1739.6 223.397H1741.37L1786.91 6.5498H1920V382.346H1823.17V246.884C1823.17 230.133 1823.61 213.019 1824.5 195.54C1825.68 177.697 1826.85 162.767 1828.03 150.75C1829.21 138.734 1829.95 131.087 1830.24 127.81H1828.48L1772.32 382.346H1695.83L1639.24 128.355H1637.47C1637.76 131.633 1638.5 139.28 1639.68 151.297C1641.15 162.949 1642.48 177.697 1643.66 195.54C1644.84 213.019 1645.43 230.133 1645.43 246.884V382.346H1555.67V6.5498H1693.62L1739.6 223.397ZM1381.42 90.126C1360.5 90.126 1344.58 97.9544 1333.67 113.612C1322.77 129.27 1317.31 150.391 1317.31 176.974V211.932C1317.31 238.514 1322.77 259.635 1333.67 275.293C1344.58 290.951 1360.5 298.779 1381.42 298.779C1402.35 298.779 1418.27 290.951 1429.18 275.293C1440.38 259.635 1445.98 238.514 1445.98 211.932V176.974C1445.98 150.391 1440.38 129.27 1429.18 113.612C1418.27 97.9545 1402.35 90.126 1381.42 90.126ZM97.7148 294.951H171.996C178.481 294.951 183.787 292.22 187.914 286.758C192.335 280.932 194.546 273.831 194.546 265.456V259.993C194.546 251.618 192.335 244.699 187.914 239.237C183.787 233.411 178.481 230.498 171.996 230.498H97.7148V294.951ZM1007.77 161.675H1071.88C1079.55 161.675 1086.03 158.397 1091.34 151.843C1096.64 144.924 1099.3 136.549 1099.3 126.717C1099.3 116.885 1096.64 108.692 1091.34 102.138C1086.03 95.5831 1079.55 92.3057 1071.88 92.3057H1007.77V161.675ZM97.7148 152.936H164.922C171.407 152.936 176.712 150.204 180.839 144.742C185.26 138.916 187.472 131.815 187.472 123.439V117.978C187.472 109.966 185.26 103.23 180.839 97.7676C176.417 91.9414 171.112 89.0284 164.922 89.0283H97.7148V152.936Z" />
                </clipPath>
              </defs>
            </svg>
        </div>

        {/* 2. Text Content Container - Responsive - PROPORTIONAL OVERLAP LOCKED */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-start px-10 md:pl-[140px] md:pr-[140px] relative -top-[6vw] md:-top-[5vw] z-20">
           
           <div className="w-full md:w-[900px] mb-12 md:mb-0">
              {title && (
                <h2 
                  className="text-[40px] md:text-[100px] font-black leading-tight md:leading-[100px] text-[#C4B647] mb-6 md:mb-10 text-center md:text-left"
                  style={{ fontFamily: "var(--font-anaheim)" }}
                >
                  {title.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i !== title.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h2>
              )}

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[#494949] text-[18px] md:text-[32px] font-semibold leading-relaxed md:leading-[50px] text-center md:text-left"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                 {description || "Busrom's business scope covers 100+ countries, not only has the ability to do OEM/ODM for our wholesalers and dealers, but also offers bespoke plans for designers, builders, and Enterprises."}
              </motion.p>
           </div>

           {/* Read More Link */}
           <Link href={ctaLink} className="flex items-center gap-[15px] hover:opacity-80 transition-opacity self-center md:self-end md:mb-4">
              <span 
                className="text-[#756F3F] text-[20px] md:text-[36px] font-bold leading-tight"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {ctaText.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i !== ctaText.split('\n').length - 1 && <br />}
                    </React.Fragment>
                ))}
              </span>
              
              <div className="w-12 h-12 md:w-[84px] md:h-[84px] rounded-full border border-[#756F3F] flex items-center justify-center text-[#756F3F] group-hover:bg-[#756F3F] group-hover:text-white transition-colors duration-300">
                 <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
              </div>
           </Link>
        </div>
      </div>
    </section>
  )
}
