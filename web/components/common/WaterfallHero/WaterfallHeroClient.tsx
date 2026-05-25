"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import type { WaterfallConfigData } from "@/lib/api/waterfall-config";

interface WaterfallHeroClientProps {
  config: WaterfallConfigData;
  images: (string | null)[];
  title?: string;
  subtitle?: string;
}

export default function WaterfallHeroClient({
  config,
  images,
  title,
  subtitle,
}: WaterfallHeroClientProps) {
  const [isDone, setIsDone] = useState(false);
  const containerControls = useAnimation();
  const textControls = useAnimation();
  const imageControls = useAnimation();

  useEffect(() => {
    // Disable scrolling while animation is playing
    document.body.style.overflow = "hidden";

    const runSequence = async () => {
      // Phase 1: Images enter (Start but do not await)
      imageControls.start((i) => ({
        x: 0,
        opacity: 1,
        transition: {
          x: {
            delay: i * config.imageStaggerDelay,
            duration: config.imageAnimationDuration,
            ease: [0.6, 0, 0.2, 1], // 对应：15帧慢启动，15帧加速，21帧平滑减速
          },
          opacity: {
            delay: i * config.imageStaggerDelay,
            duration: config.imageAnimationDuration,
            ease: "linear", // 透明度匀速
          }
        },
      }));

      // Calculate when Phase 3 should start to support negative hold duration (overlap)
      // 5 images means max index is 4
      const totalPhase1Time = (4 * config.imageStaggerDelay) + config.imageAnimationDuration;
      let phase3StartTime = totalPhase1Time + config.imageHoldDuration;
      if (phase3StartTime < 0) phase3StartTime = 0; // Prevent negative timeout

      // Wait until it's time to start Phase 3
      await new Promise((resolve) => setTimeout(resolve, phase3StartTime * 1000));

      // Phase 3: Text enter AND Images hide simultaneously
      // Note: This will smoothly override the opacity of images if they are still entering,
      // while their x translation naturally finishes.
      imageControls.start({
        opacity: 0,
        transition: {
          duration: config.textAnimationDuration,
          ease: "easeOut",
        },
      });

      await textControls.start({
        opacity: 1,
        x: 0,
        transition: {
          duration: config.textAnimationDuration,
          ease: "easeOut",
        },
      });

      // Phase 4: Text hold
      await new Promise((resolve) => setTimeout(resolve, config.textHoldDuration * 1000));

      // Phase 5: Exit (Slide entire container up)
      await containerControls.start({
        y: "-100%",
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      });

      // Done
      document.body.style.overflow = "";
      setIsDone(true);
    };

    runSequence();

    return () => {
      document.body.style.overflow = "";
    };
  }, [config, containerControls, textControls, imageControls]);

  if (isDone) return null;

  // Responsive layout configurations matching the design drafts
  // Desktop: 1920x500
  // Tablet: 768x500
  // Mobile: 390x265
  return (
    <motion.div
      initial={{ y: "0%" }}
      animate={containerControls}
      className="fixed top-0 left-0 right-0 w-full z-40 bg-[#f6f4ed] overflow-hidden flex items-center justify-center
                 h-[265px] md:h-[500px] xl:h-[500px]"
    >
      <div className="relative w-full max-w-[1920px] h-full mx-auto flex items-center justify-center">
        {/* IMAGE ANIMATION AREA */}
        <div className="absolute w-[390px] h-[265px] md:w-[768px] md:h-[500px] xl:w-[1024px] xl:h-[500px]">
          {/* Layer 1 */}
          {images[0] && (
            <motion.img
              custom={4}
              initial={{ x: 50, opacity: 0 }}
              animate={imageControls}
              src={images[0]}
              className="absolute object-cover shadow-[0_8px_8.75px_-6px_rgba(0,0,0,0.1),0_20px_21.875px_-5px_rgba(0,0,0,0.1)] 
                         border border-transparent
                         w-[111px] h-[84px] left-[74px] top-[66px]
                         md:w-[216px] md:h-[136px] md:left-[175px] md:top-[131px]
                         xl:w-[236px] xl:h-[157px] xl:left-[259px] xl:top-[85px]"
              alt="Waterfall 1"
            />
          )}

          {/* Layer 2 */}
          {images[1] && (
            <motion.img
              custom={1}
              initial={{ x: 50, opacity: 0 }}
              animate={imageControls}
              src={images[1]}
              className="absolute object-cover shadow-[0_8px_8.75px_-6px_rgba(0,0,0,0.1),0_20px_21.875px_-5px_rgba(0,0,0,0.1)]
                         border border-transparent
                         w-[95px] h-[65px] left-[82px] top-[164px]
                         md:w-[177px] md:h-[112px] md:left-[155px] md:top-[296px]
                         xl:w-[228px] xl:h-[150px] xl:left-[227px] xl:top-[259px]"
              alt="Waterfall 2"
            />
          )}

          {/* Layer 3 */}
          {images[2] && (
            <motion.img
              custom={2}
              initial={{ x: 50, opacity: 0 }}
              animate={imageControls}
              src={images[2]}
              className="absolute object-cover shadow-[0_8px_8.75px_-6px_rgba(0,0,0,0.1),0_20px_21.875px_-5px_rgba(0,0,0,0.1)]
                         border border-transparent
                         w-[103px] h-[133px] left-[213px] top-[36px]
                         md:w-[190px] md:h-[236px] md:left-[407px] md:top-[68px]
                         xl:w-[216px] xl:h-[260px] xl:left-[561px] xl:top-[51px]"
              alt="Waterfall 3"
            />
          )}

          {/* Layer 4 */}
          {images[3] && (
            <motion.img
              custom={3}
              initial={{ x: 50, opacity: 0 }}
              animate={imageControls}
              src={images[3]}
              className="absolute object-cover shadow-[0_8px_8.75px_-6px_rgba(0,0,0,0.1),0_20px_21.875px_-5px_rgba(0,0,0,0.1)]
                         border border-transparent
                         w-[106px] h-[70px] left-[185px] top-[150px]
                         md:w-[196px] md:h-[124px] md:left-[353px] md:top-[251px]
                         xl:w-[212px] xl:h-[142px] xl:left-[466px] xl:top-[290px]"
              alt="Waterfall 4"
            />
          )}

          {/* Layer 5 */}
          {images[4] && (
            <motion.img
              custom={0}
              initial={{ x: 50, opacity: 0 }}
              animate={imageControls}
              src={images[4]}
              className="absolute object-cover shadow-[0_25px_43.75px_-12px_rgba(0,0,0,0.25)] border-[4px] border-white
                         w-[122px] h-[84px] left-[130px] top-[96px]
                         md:w-[206px] md:h-[148px] md:left-[261px] md:top-[192px] md:-rotate-[4.7deg]
                         xl:w-[243px] xl:h-[155px] xl:left-[360px] xl:top-[163px] xl:rotate-0"
              alt="Waterfall 5"
            />
          )}
        </div>

        {/* TEXT ANIMATION AREA */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={textControls}
          className="absolute z-10 flex flex-col items-center justify-center text-center
                     w-[360px] gap-2
                     md:w-[600px] md:gap-4
                     xl:w-[1024px] xl:gap-6"
        >
          {title && (
            <h1 className="font-josefin-sans font-bold text-[#756f3f] leading-tight whitespace-pre-line
                           text-[24px] 
                           md:text-[36px] 
                           xl:text-[56px]">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="font-josefin-sans font-normal text-[#383838] leading-tight whitespace-pre-line
                          text-[16px]
                          md:text-[16px]
                          xl:text-[24px]">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
