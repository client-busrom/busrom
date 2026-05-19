"use client";

import React from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { HollowText } from "@/components/common/HollowText";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;
const mvw = (px: number) => `clamp(${px * 0.6}px, ${(px / 390) * 100}vw, ${px}px)`;

// Simplified Passive Water Ripple Logic
class PassiveRipple {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private rippleMap: Int32Array;
  private lastMap: Int32Array;
  private texture: ImageData | null = null;
  private ripple: ImageData | null = null;
  private animationId: number | null = null;

  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true })!;
    this.width = canvas.width;
    this.height = canvas.height;

    const size = this.width * (this.height + 2) * 2;
    this.rippleMap = new Int32Array(size);
    this.lastMap = new Int32Array(size);

    try {
      const imgRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = this.width / this.height;
      let dw, dh, dx, dy;
      if (imgRatio > canvasRatio) {
        dh = this.height;
        dw = this.height * imgRatio;
        dx = (this.width - dw) / 2;
        dy = 0;
      } else {
        dw = this.width;
        dh = this.width / imgRatio;
        dx = 0;
        dy = (this.height - dh) / 2;
      }

      this.ctx.drawImage(image, dx, dy, dw, dh);
      this.texture = this.ctx.getImageData(0, 0, this.width, this.height);
      this.ripple = this.ctx.getImageData(0, 0, this.width, this.height);
    } catch (err) {
      this.canvas.style.display = "none";
    }
    
    this.animate = this.animate.bind(this);
  }

  drop(x: number, y: number, radius: number, strength: number) {
    const r2 = radius * radius;
    const w2 = this.width + 2;
    for (let j = -radius; j < radius; j++) {
      const py = Math.floor(y + j);
      if (py < 0 || py >= this.height) continue;
      const j2 = j * j;
      for (let k = -radius; k < radius; k++) {
        if (j2 + k * k < r2) {
          const px = Math.floor(x + k);
          if (px >= 0 && px < this.width) {
            this.rippleMap[w2 * (py + 1) + px + 1] += strength;
          }
        }
      }
    }
  }

  private animate(time: number) {
    this.animationId = requestAnimationFrame(this.animate);
    
    // Performance optimization: Limit to ~30 FPS
    if (time - this.lastTime < 32) return;
    this.lastTime = time;

    const w = this.width;
    const h = this.height;
    const w2 = w + 2;

    const temp = this.lastMap;
    this.lastMap = this.rippleMap;
    this.rippleMap = temp;

    for (let y = 1; y <= h; y++) {
      const yw2 = y * w2;
      for (let x = 1; x <= w; x++) {
        let val = ((this.lastMap[yw2 - w2 + x] + this.lastMap[yw2 + w2 + x] + this.lastMap[yw2 + x - 1] + this.lastMap[yw2 + x + 1]) >> 1) - this.rippleMap[yw2 + x];
        val -= val >> 5;
        this.rippleMap[yw2 + x] = val;
      }
    }

    if (!this.texture || !this.ripple) return;
    const tData = this.texture.data;
    const rData = this.ripple.data;

    for (let y = 1; y <= h; y++) {
      const yw2 = y * w2;
      const yw = (y - 1) * w;
      for (let x = 1; x <= w; x++) {
        const dx = this.rippleMap[yw2 + x - 1] - this.rippleMap[yw2 + x + 1];
        const dy = this.rippleMap[yw2 - w2 + x] - this.rippleMap[yw2 + w2 + x];
        let sx = Math.floor(x + (dx >> 3));
        let sy = Math.floor(y + (dy >> 3));
        if (sx < 0) sx = 0; if (sx >= w) sx = w - 1;
        if (sy < 0) sy = 0; if (sy >= h) sy = h - 1;
        
        const srcIdx = (sy * w + sx) << 2;
        const dstIdx = (yw + (x - 1)) << 2;
        const shade = Math.min(255, Math.max(0, 128 + (dx >> 1))) / 128;
        
        rData[dstIdx] = Math.min(255, tData[srcIdx] * shade);
        rData[dstIdx + 1] = Math.min(255, tData[srcIdx + 1] * shade);
        rData[dstIdx + 2] = Math.min(255, tData[srcIdx + 2] * shade);
        rData[dstIdx + 3] = 255;
      }
    }
    this.ctx.putImageData(this.ripple, 0, 0);
  }

  start() { this.animationId = requestAnimationFrame(this.animate); }
  stop() { if (this.animationId) cancelAnimationFrame(this.animationId); }
}

interface FaqQuoteSectionProps {
  data: {
    image: any;
    title: any[];
    description: any[];
    iconList: any;
    decoratorText: string;
  };
  locale: string;
}

export function FaqQuoteSection({ data, locale }: FaqQuoteSectionProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rippleInstance = React.useRef<PassiveRipple | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (!canvasRef.current || !data.image?.url) return;
    const canvas = canvasRef.current;
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    const initRipple = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        // Reduced resolution from 0.5 to 0.3 for better performance
        canvas.width = rect.width * 0.3;
        canvas.height = rect.height * 0.3;
        rippleInstance.current = new PassiveRipple(canvas, img);
        rippleInstance.current.start();

        let timeoutId: NodeJS.Timeout;
        const scheduleDrop = () => {
          const delay = 3500 + Math.random() * 2500;
          timeoutId = setTimeout(() => {
            // Only drop if page is visible to prevent "ripple explosion" when switching back
            if (rippleInstance.current && document.visibilityState === "visible") {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height;
              rippleInstance.current.drop(x, y, 12, 350);
            }
            scheduleDrop();
          }, delay);
        };

        scheduleDrop();

        return () => {
          clearTimeout(timeoutId);
          rippleInstance.current?.stop();
        };
      }
    };

    img.onload = initRipple;
    img.src = data.image.url;
    
    if (img.complete) initRipple();

    return () => {
      rippleInstance.current?.stop();
    };
  }, [data.image?.url]);

  const getNodesText = (nodes: any[] | undefined | null): string => {
    if (!nodes || !Array.isArray(nodes)) return "";
    return nodes
      .map((n: any) => {
        if (!n) return "";
        if (n.type === "text") return n.text || "";
        if (n.type === "linebreak") return "\n";
        if (n.children) return getNodesText(n.children);
        return "";
      })
      .join("");
  };

  const exitLinks = data.iconList?.items || [];
  const decoratorChars = (data.decoratorText || "BUSROM").split("");

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f6f4ed]"
      style={{ height: isMobile ? "auto" : vw(922), paddingBottom: isMobile ? mvw(100) : 0 }}
    >
      {/* Top Banner Image with Floating Decorators */}
      <div
        className="absolute left-0 overflow-hidden"
        style={{ 
          width: isMobile ? "100%" : vw(1737), 
          height: isMobile ? mvw(400) : vw(268), 
          top: isMobile ? 0 : vw(80) 
        }}
      >
        <OptimizedImage
          image={data.image}
          className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
        />

        {/* Water Ripple Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-[1]"
          style={{ width: "100%", height: "100%" }}
        />

        <div className="absolute inset-0 bg-[#464010] opacity-30 z-[2]" />

        {/* Floating Background Decorators - Inside Image */}
        <div className="absolute inset-y-0 left-0 right-0 opacity-100 pointer-events-none flex justify-center items-center z-20 overflow-hidden">
          <div className="flex items-center">
            {decoratorChars.map((letter, i) => (
              <motion.div
                key={i}
                animate={{
                  y:
                    i % 2 === 0
                      ? [isMobile ? mvw(-30) : vw(-50), isMobile ? mvw(30) : vw(50), isMobile ? mvw(-30) : vw(-50)]
                      : [isMobile ? mvw(30) : vw(-50), isMobile ? mvw(-30) : vw(50), isMobile ? mvw(30) : vw(-50)],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="font-normal font-tenor-sans"
                style={{
                  fontSize: isMobile ? mvw(60) : vw(280),
                  color: "#f6f4ed",
                  marginLeft: i === 0 ? 0 : isMobile ? mvw(8) : vw(40),
                }}
              >
                {letter}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`w-full h-full flex relative z-10 ${isMobile ? "flex-col items-start" : "items-center"}`}
        style={{
          paddingLeft: isMobile ? mvw(40) : vw(220),
          paddingRight: isMobile ? mvw(40) : vw(220),
          paddingTop: isMobile ? mvw(420) : vw(300),
          gap: isMobile ? mvw(60) : vw(160),
        }}
      >
        {/* Left: Slogan Text */}
        <div
          className="flex flex-col"
          style={{ width: isMobile ? "100%" : "fit-content", minWidth: isMobile ? 0 : vw(737) }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-[#363105] ${isMobile ? "whitespace-normal" : "whitespace-pre-line"}`}
            style={{
              fontSize: isMobile ? mvw(32) : vw(64),
              lineHeight: 1.2,
              fontFamily: "var(--font-agbalumo), cursive",
              marginBottom: isMobile ? mvw(10) : vw(30),
            }}
          >
            {getNodesText(data.title) ||
              "Every Detail Is The\nBeginning Of Better\nCooperation"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`text-[#797133] font-medium ${isMobile ? "whitespace-normal" : "whitespace-pre-line"}`}
            style={{
              fontSize: isMobile ? mvw(18) : vw(24),
              lineHeight: 1.6,
              fontFamily: "var(--font-agbalumo), cursive",
            }}
          >
            {getNodesText(data.description) ||
              "At Busrom, We Don't Just Solve Problems—We're Committed To Providing\nLong-Term, Reliable Support And Collaboration."}
          </motion.p>
        </div>

        {/* Right: Exit Navigation Buttons */}
        <div 
          className={`flex flex-col ${isMobile ? "w-full items-start" : "flex-1 items-end"}`} 
          style={{ gap: isMobile ? mvw(24) : vw(36) }}
        >
          {exitLinks.map((link: any, i: number) => (
            <motion.a
              key={i}
              href={link.url || "#"}
              target={link.openInNewTab ? "_blank" : undefined}
              initial={{ opacity: 0, x: isMobile ? -30 : 40, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: true }}
              whileHover={isMobile ? {} : { scale: 1.05 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.1 * i,
              }}
              className="flex items-center justify-between bg-[#756f3f] hover:bg-white border border-transparent hover:border-[#756f3f] transition-all duration-300 rounded-full relative group cursor-pointer"
              style={{
                width: isMobile ? "100%" : vw(517),
                height: isMobile ? mvw(72) : vw(89),
                paddingLeft: isMobile ? mvw(32) : vw(48),
                paddingRight: isMobile ? mvw(16) : vw(30),
              }}
            >
              <span
                className="text-white group-hover:text-[#756f3f] font-semibold transition-colors duration-300"
                style={{
                  fontSize: isMobile ? mvw(20) : vw(32),
                  fontFamily: "var(--font-anaheim), sans-serif",
                }}
              >
                {link.title || link.label}
              </span>
              <div
                className="bg-white group-hover:bg-[#756f3f] rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-[45deg] shrink-0"
                style={{
                  width: isMobile ? mvw(54) : vw(72),
                  height: isMobile ? mvw(54) : vw(72),
                  marginRight: isMobile ? mvw(-5) : vw(-20),
                }}
              >
                <div className="text-[#756f3f] group-hover:text-white transition-colors duration-300">
                  <IconifyIcon
                    name="lucide:arrow-up-right"
                    color="currentColor"
                    size={isMobile ? mvw(32) : vw(42)}
                  />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
