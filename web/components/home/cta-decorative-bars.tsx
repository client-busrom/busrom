"use client";

import { motion, Transition } from "framer-motion";
import { cn } from "@/lib/utils";

// --- 走马灯组件 (内部使用) ---
const MarqueeText = ({
  direction = "left",
  textColor = "white",
}: {
  direction?: "left" | "right";
  textColor?: string;
}) => {
  const texts = Array(20).fill("Busrom");

  return (
    <div className="flex whitespace-nowrap overflow-hidden">
      <div
        className={cn(
          "flex gap-[65px] animate-marquee",
          direction === "right" && "animate-marquee-reverse"
        )}
        style={{ color: textColor }}
      >
        {texts.map((text, i) => (
          <span
            key={i}
            className="font-anaheim font-semibold text-[16px] lg:text-[20px]"
          >
            {text}
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
        {texts.map((text, i) => (
          <span
            key={`dup-${i}`}
            className="font-anaheim font-semibold text-[16px] lg:text-[20px]"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * CtaDecorativeBars - 原 SimpleCta 顶部的两条交叉走马灯装饰条
 * 保留逻辑，作为独立组件封装，供以后可能的使用。
 */
export function CtaDecorativeBars() {
  return (
    <motion.div
      className="relative h-[180px] lg:h-[230px] w-full overflow-hidden"
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
        <MarqueeText direction="right" textColor="#756F3F" />
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
        <MarqueeText direction="left" textColor="#FFFFFF" />
      </motion.div>
    </motion.div>
  );
}
