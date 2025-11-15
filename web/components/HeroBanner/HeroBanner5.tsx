// components/HeroBanner/HeroBanner5.tsx
import Image from "next/image";
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data"; // Ensure path is correct
import { Locale } from "@/i18n.config"; // Ensure path is correct
import { cn, getObjectPosition } from "@/lib/utils"; // Import cn and getObjectPosition

// --- BannerProps Definition ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- HeroBanner5 Component ---
const HeroBanner5: FC<BannerProps> = ({ data, locale }) => {
  const imageUrl: string = data.images[0]?.url || "/placeholder.jpg";
  const svgUrl: string = "/HeroBanner5.svg"; // <-- Confirm path

  // --- Split Feature[0] ---
  const feature0Text = data.features[0] || "";
  const words = feature0Text.split("\n");
  const titleLine1 = words[0] || "";
  const titleLine2 = words.slice(1).join(" ");

  // --- Gradient Mask for Feature Stack ---
  // Left (#A4940C) solid -> Right (#847B2C) transparent
  const featureMaskStyle = {
    maskImage: 'linear-gradient(to right, black 0%, transparent 80%)',
    WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 80%)',
  };

  return (
    <section className="relative w-full h-full overflow-hidden font-sans">
      {/* Layer 1: Background Image (z-0) */}
      <Image
        src={imageUrl}
        alt="Background"
        fill
        sizes="100vw"
        quality={90}
        className="object-cover z-0"
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
        priority
      />

      {/* Layer 2: SVG Mask (z-10) */}
      <Image
        src={svgUrl}
        alt="Mask"
        fill
        sizes="100vw"
        className="object-cover z-10 pointer-events-none" // Adjust object-position if needed
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
      />

      {/* Layer 3: Rotated Image Divs (z-20) */}
      {/* Positioned slightly left of center */}
      {/* Top Rotated Div */}
      <div
        className={cn(
          "absolute top-[-5%] left-[45%] transform -translate-x-1/2", // Position top-left of center
          "w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96", // Responsive size
          "border-[7px] md:border-[13px] lg:border-[19px] border-[#756F3F]",
          "rounded-[50px] md:rounded-[75px] lg:rounded-[100px]", // Border & rounding
          "rotate-45 overflow-hidden z-20" // Rotation & clipping
        )}
      >
        <div className="relative w-full h-full">
          <Image
            src={data.images[1]?.url || "/placeholder.jpg"} // <-- Replace with actual image path
            alt="Top rotated image"
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover -rotate-45 scale-150" // Counter-rotate image
          />
        </div>
      </div>
      {/* Bottom Rotated Div */}
      <div
        className={cn(
          "absolute bottom-[-5%] left-[45%] transform -translate-x-1/2", // Position bottom-right of center (adjust left % slightly)
          "w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96", // Responsive size
          "border-[7px] md:border-[13px] lg:border-[19px] border-[#756F3F]",
          "rounded-[50px] md:rounded-[75px] lg:rounded-[100px]", // Border & rounding
          "rotate-45 overflow-hidden z-20" // Rotation & clipping
        )}
      >
         <div className="relative w-full h-full">
          <Image
            src={data.images[2]?.url || "/placeholder.jpg"} // <-- Replace with actual image path
            alt="Bottom rotated image"
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover -rotate-45 scale-150" // Counter-rotate image
          />
        </div>
      </div>


      {/* Layer 4: Content Grid (z-30) */}
      <div className="relative z-30 grid grid-cols-1 md:grid-cols-2 h-full w-full items-center p-8 md:p-16 lg:px-24">

        {/* --- Left Column (Text) --- */}
        <div className="flex flex-col justify-center h-full text-left max-w-lg"> {/* Added max-width */}
          {/* Feature[0] - Title */}
          <h1 className="text-[#433E12] mb-12 leading-tight">
            <div className="text-4xl md:text-6xl font-regular font-pavanam">{titleLine1}</div>
            <div className="text-5xl md:text-7xl font-regular font-paytone-one">{titleLine2}</div>
          </h1>

          {/* Feature Stack (Gradient masked) */}
          <div className="space-y-4 w-full">
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                // Apply color gradient AND mask
                className="bg-gradient-to-r from-[#A4940C] to-[#847B2C] px-6 py-3" // Added rounded-md for slight softness
                style={featureMaskStyle}
              >
                <p className="text-base md:text-lg font-medium text-[#000000]">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Right Column (Feature[1]) --- */}
        {/* Use flex to push content to bottom-right */}
        <div className="absolute h-full w-1/3 right-[5%] bottom-[20%] flex flex-col justify-end items-end text-right pb-8 md:pb-16">
          <p className="font-regular font-paytone-one text-xl md:text-4xl text-white text-stroke-custom-white">
            {data.features[1]}
          </p>
        </div>

      </div>
    </section>
  );
};

export default HeroBanner5;