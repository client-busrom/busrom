"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function ErrorImageWall() {
  const [positions, setPositions] = useState<number[]>([0, 1, 2, 3, 4]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const images = [
    "/homeProductSeries/glass_clip_washroom.png",
    "/homeProductSeries/hidden_hook.png",
    "/homeProductSeries/bathroom_&_door_handle.png",
    "/homeProductSeries/glass_connected_fitting.png",
    "/homeProductSeries/glass_standoff.png",
  ];

  const DESIGN_SIZE = 800;

  const IMAGE_POSITIONS = {
    main: { x: 380, y: 350, w: 340, h: 340, zIndex: 5 },
    bg: [
      { x: 120, y: 450, w: 240, h: 240, zIndex: 4 },
      { x: 250, y: 120, w: 280, h: 280, zIndex: 3 },
      { x: 80, y: 240, w: 200, h: 200, zIndex: 2 },
      { x: 580, y: 180, w: 180, h: 180, zIndex: 1 },
    ],
  };

  const getPositionStyle = (positionIndex: number) => {
    if (positionIndex === 0) return IMAGE_POSITIONS.main;
    return IMAGE_POSITIONS.bg[positionIndex - 1] || IMAGE_POSITIONS.bg[0];
  };

  const handleImageClick = (positionIndex: number) => {
    if (positionIndex === 0) return;
    setPositions((prev) => {
      const newPositions = [...prev];
      const temp = newPositions[0];
      newPositions[0] = newPositions[positionIndex];
      newPositions[positionIndex] = temp;
      return newPositions;
    });
  };

  const springTransition = {
    type: "spring",
    stiffness: 120,
    damping: 15,
    mass: 1,
  } as const;

  return (
    <div className="relative w-full h-[500px] lg:h-full lg:w-[800px] max-w-full pointer-events-none overflow-visible lg:-translate-y-12">
      {images.map((img, imageIndex) => {
        const positionIndex = positions.indexOf(imageIndex);
        if (positionIndex === -1) return null;

        const isMain = positionIndex === 0;
        const pos = getPositionStyle(positionIndex);
        const isHovered = hoveredIndex === positionIndex;

        const animateProps: any = {
          left: `${(pos.x / DESIGN_SIZE) * 100}%`,
          top: `${(pos.y / DESIGN_SIZE) * 100}%`,
          width: `${(pos.w / DESIGN_SIZE) * 100}%`,
          height: `${(pos.h / DESIGN_SIZE) * 100}%`,
          x: "0%",
          y: "0%",
          scale: 1,
          rotate: 0,
          zIndex: pos.zIndex,
          opacity: 1,
        };

        if (hoveredIndex !== null) {
          if (isHovered) {
            animateProps.scale = 1.08;
            animateProps.zIndex = 30;
            animateProps.opacity = 1;
          } else if (isMain) {
            animateProps.x = "-5%";
            animateProps.y = "-5%";
            animateProps.scale = 0.95;
            animateProps.rotate = -3;
            animateProps.opacity = 0.9;
          } else {
            if (positionIndex === 1) {
              animateProps.x = "-3%";
              animateProps.y = "3%";
              animateProps.rotate = -2;
            } else if (positionIndex === 2) {
              animateProps.x = "4%";
              animateProps.y = "-2%";
              animateProps.rotate = 3;
            } else if (positionIndex === 3) {
              animateProps.x = "-4%";
              animateProps.y = "-4%";
              animateProps.rotate = -4;
            } else if (positionIndex === 4) {
              animateProps.x = "5%";
              animateProps.y = "2%";
              animateProps.rotate = 4;
            }
          }
        }

        return (
          <motion.div
            key={`img-${imageIndex}`}
            className="absolute bg-white rounded-[20px] lg:rounded-[30px] shadow-2xl pointer-events-auto flex items-center justify-center overflow-hidden cursor-pointer p-2 lg:p-4"
            animate={animateProps}
            transition={springTransition}
            onHoverStart={() => setHoveredIndex(positionIndex)}
            onHoverEnd={() => setHoveredIndex(null)}
            onClick={() => handleImageClick(positionIndex)}
          >
            <div className="relative w-full h-full rounded-[10px] lg:rounded-[20px] overflow-hidden bg-brand-main">
              <Image
                src={img}
                alt="Product Preview"
                fill
                sizes="(max-width: 1024px) 40vw, 20vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
