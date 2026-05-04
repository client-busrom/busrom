"use client"

import React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface LexicalTextNode {
  text: string
  format?: number
  type: string
}

interface StoryHeroSectionProps {
  data: {
    titleNodes: LexicalTextNode[] | null
    subtitle: string
    content: string
    descriptionNodes: LexicalTextNode[] | null
    items: string[]
    heroImage: any // Use any or specific MediaObject to be safe
  }
}

export function StoryHeroSection({ data }: StoryHeroSectionProps) {
  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{ 
        height: vw(968),
        backgroundColor: "#57522a", // bg-color (jRJdB)
        paddingTop: vw(42)
      }}
    >
      {/* Decorative Rotating/Orbiting Group (nGVh4 + dJZzU) */}
      <div 
        className="absolute pointer-events-none"
        style={{ 
          left: vw(370), 
          top: vw(440),
          width: vw(408),
          height: vw(168),
          zIndex: 1
        }}
      >
        {/* The Ellipse Border */}
        <div 
          className="absolute inset-0 border border-[#d6cd884a]" 
          style={{ 
            borderRadius: "50%",
            transform: "rotate(-22.02deg)",
          }}
        />

        {/* Orbiting Star */}
        <motion.div
          className="absolute"
          style={{ 
            width: vw(38), 
            height: vw(38),
            marginLeft: vw(-19),
            marginTop: vw(-19),
            zIndex: 3
          }}
          animate={{ 
            left: Array.from({ length: 61 }).map((_, i) => {
              const t = (i / 60) * 2 * Math.PI
              const a = 204 // 408/2
              const b = 84 // 168/2
              const rot = -22.02 * (Math.PI / 180)
              const x = a * Math.cos(t) * Math.cos(rot) - b * Math.sin(t) * Math.sin(rot)
              return vw(204 + x)
            }),
            top: Array.from({ length: 61 }).map((_, i) => {
              const t = (i / 60) * 2 * Math.PI
              const a = 204
              const b = 84
              const rot = -22.02 * (Math.PI / 180)
              const y = a * Math.cos(t) * Math.sin(rot) + b * Math.sin(t) * Math.cos(rot)
              return vw(84 + y)
            }),
            rotate: 360
          }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity 
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
             <path 
               d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z" 
               fill="#9b9352" 
             />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        
        {/* hero-section-title (sioIS styled text) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute font-joan flex flex-col items-start"
          style={{ 
            left: vw(160), 
            top: vw(160),
            fontSize: vw(180),
            lineHeight: 0.55,
            fontWeight: 700,
            textShadow: `0 ${vw(4)} ${vw(11)} #565020`,
            letterSpacing: vw(6),
            zIndex: 10
          }}
        >
          {(() => {
            const lines: LexicalTextNode[][] = [[]];
            data.titleNodes?.forEach(node => {
              if (node.type === "linebreak") {
                lines.push([]);
              } else {
                lines[lines.length - 1].push(node);
              }
            });
            return lines.map((line, idx) => (
              <div 
                key={idx} 
                className="relative"
                style={{ zIndex: lines.length - idx }}
              >
                {line.map((node, nIdx) => (
                  <span 
                    key={nIdx}
                    style={{ color: node.format === 1 ? "#ffa100" : "#fff07c" }}
                  >
                    {node.text}
                  </span>
                ))}
              </div>
            ));
          })()}
        </motion.div>

        {/* hero-section-description (7L57R) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute flex flex-col items-start whitespace-pre-wrap font-josefin-sans"
          style={{ 
            left: vw(820), 
            top: vw(120),
            zIndex: 10
          }}
        >
          <div style={{ fontSize: vw(29), lineHeight: 1.5, fontWeight: 600, textShadow: `0 ${vw(4)} ${vw(11)} #565020` }}>
            {data.descriptionNodes ? data.descriptionNodes.map((node, idx) => {
              if (node.type === "linebreak") return <br key={idx} />;
              const isBold = node.format === 1;
              return (
                <span key={idx} style={{ color: isBold ? "#F7FF5A" : "#FFFFFF" }}>
                   {node.text}
                </span>
              );
            }) : null}
          </div>
        </motion.div>

        {/* hero-section-subtitle (0flkN) */}
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute font-bold font-josefin-sans-sans tracking-tight drop-shadow-lg text-white"
          style={{ 
            left: vw(842), 
            top: vw(518),
            fontSize: vw(60),
            lineHeight: 1.15,
            zIndex: 10
          }}
        >
          {data.subtitle}
        </motion.h2>

        {/* hero-section-content (oseS3) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute"
          style={{ 
            left: vw(159), 
            top: vw(644),
            width: vw(639),
            zIndex: 10
          }}
        >
          <p 
            className="text-white opacity-90 drop-shadow-md font-josefin-sans whitespace-pre-wrap"
            style={{ 
               fontSize: vw(24),
               lineHeight: 1.5
            }}
          >
            {data.content}
          </p>
        </motion.div>

        {/* hero-section-item (fMU3I) - Stepped Staircase Distribution */}
        <div 
          className="absolute"
          style={{ 
            left: vw(901), 
            top: vw(621),
            width: vw(1000),
            height: vw(300),
            zIndex: 10
          }}
        >
           {/* Item 1 (oPtbM) */}
           {data.items[0] && (
             <HeroFeatureItem text={data.items[0]} delay={0.6} width={vw(220)} x={0} y={0} starX={185} starY={-12} />
           )}
           {/* Item 2 (yw8qV) */}
           {data.items[1] && (
             <HeroFeatureItem text={data.items[1]} delay={0.7} width={vw(220)} x={85} y={95} starX={185} starY={-12} />
           )}
           {/* Item 3 (TwEBx) */}
           {data.items[2] && (
             <HeroFeatureItem text={data.items[2]} delay={0.8} width={vw(420)} x={170} y={190} starX={380} starY={-12} />
           )}
        </div>

        {/* hero-section-image frame (nwugw / Rectangle 394) */}
        <div 
          className="absolute"
          style={{ 
            left: vw(900), 
            top: vw(37), 
            width: vw(1020), 
            height: vw(782),
            borderRadius: `${vw(421.5)} 0 0 ${vw(421.5)}`,
            border: `${vw(1)} solid #d6cd88`,
            zIndex: 5
          }}
        />

        {/* hero-section-image (TK12D) */}
        <div 
          className="absolute overflow-hidden"
          style={{ 
            left: vw(922), 
            top: vw(102), 
            width: vw(998), 
            height: vw(748),
            borderRadius: `${vw(421.5)} 0 0 ${vw(421.5)}`,
            zIndex: 6
          }}
        >
           <OptimizedImage
            image={data.heroImage}
            alt="Hero Image"
            size="xlarge"
            className="w-full h-full object-cover"
            priority
          />
        </div>

      </div>
    </section>
  )
}

function HeroFeatureItem({ text, delay, width, x, y, starX, starY }: { text: string, delay: number, width: string, x: number, y: number, starX: number, starY: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="absolute flex items-center justify-center rounded-[49px] border border-[#ffec51] bg-[#3a20008c] shadow-[0_0_12px_#ffbf51] px-8"
      style={{ 
        height: vw(78),
        width: width,
        left: vw(x),
        top: vw(y)
      }}
    >
      <span 
        className="text-[#ffec51] font-normal font-josefin-sans flex items-center justify-center text-center"
        style={{ 
          fontSize: vw(40),
          lineHeight: 1.2 // Better for vertical alignment than leading-none
        }}
      >
        {text}
      </span>
      {/* Item Star (dXpCt) */}
      <motion.div 
        className="absolute"
        style={{ 
          top: vw(starY), 
          left: vw(starX), 
          width: vw(28), 
          height: vw(28) 
        }}
        animate={{ 
          opacity: [1, 0.3, 1],
          scale: [1, 1.15, 1],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 2 + Math.random(), 
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 2 // Use the existing delay to stagger the blinking
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 30 30" fill="none">
           <path 
             d="M14.7165 0.92389c-0.42564-1.23186-1.10666-1.23186-1.53231 0l-2.35521 6.93806c-0.41145 1.23186-1.7735 2.57699-2.99366 3.00177l-6.90955 2.35044c-1.23436 0.42478-1.23436 1.10442 0 1.5292l6.86698 2.37876c1.23435 0.42478 2.58221 1.78407 3.00786 3.00177l2.39777 6.95221c0.42564 1.23186 1.10666 1.23186 1.5323 0l2.34102-6.90973c0.41145-1.23186 1.75931-2.57699 2.99367-3.00177l7.00887-2.39292c1.23436-0.42478 1.23436-1.10442 0-1.51504l-6.89537-2.32213c-1.23436-0.41062-2.58221-1.75575-3.00785-2.98761-0.04256-0.01416-2.45452-7.02301-2.45452-7.02301z" 
             fill="#ffec51" 
           />
        </svg>
      </motion.div>
    </motion.div>
  )
}
