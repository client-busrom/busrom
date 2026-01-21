"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// 走马灯文字组件
const MarqueeText = ({
  direction = "left",
  textColor = "white",
  text = "Busrom",
}: {
  direction?: "left" | "right"
  textColor?: string
  text?: string
}) => {
  const texts = Array(20).fill(text)

  return (
    <div className="flex whitespace-nowrap overflow-hidden gap-[65px]">
      <div
        className={cn(
          "flex gap-[65px] animate-marquee",
          direction === "right" && "animate-marquee-reverse"
        )}
        style={{ color: textColor }}
      >
        {texts.map((t, i) => (
          <span
            key={i}
            className="font-anaheim font-semibold text-[16px] lg:text-[20px]"
          >
            {t}
          </span>
        ))}
      </div>
      <div
        className={cn(
          "flex gap-[65px] animate-marquee",
          direction === "right" && "animate-marquee-reverse"
        )}
        style={{ color: textColor }}
      >
        {texts.map((t, i) => (
          <span
            key={`dup-${i}`}
            className="font-anaheim font-semibold text-[16px] lg:text-[20px]"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

interface ProductMarqueeBannerProps {
  text?: string
}

export function ProductMarqueeBanner({ text = "Busrom" }: ProductMarqueeBannerProps) {
  return (
    <motion.div
      className="relative h-[180px] lg:h-[230px] w-full overflow-hidden bg-brand-main"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* 下层装饰条 */}
      <motion.div
        className="absolute w-[120%] left-[-10%] flex items-center justify-center"
        style={{
          height: "48px",
          top: "50%",
          backgroundColor: "#EBE6D7",
          transformOrigin: "center center",
        }}
        variants={{
          hidden: { x: "-100%", rotate: 4.53, y: "-50%" },
          visible: { x: 0, rotate: 4.53, y: "-50%" },
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <MarqueeText direction="right" textColor="#756F3F" text={text} />
      </motion.div>

      {/* 上层装饰条 */}
      <motion.div
        className="absolute w-[120%] left-[-10%] flex items-center justify-center"
        style={{
          height: "48px",
          top: "50%",
          backgroundColor: "#756F3F",
          transformOrigin: "center center",
        }}
        variants={{
          hidden: { x: "100%", rotate: -2.78, y: "-50%" },
          visible: { x: 0, rotate: -2.78, y: "-50%" },
        }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <MarqueeText direction="left" textColor="#FFFFFF" text={text} />
      </motion.div>
    </motion.div>
  )
}
