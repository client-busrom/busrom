"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, locales } from "@/i18n.config";

export default function NotFound() {
  const pathname = usePathname();

  // Simple locale detection from pathname
  const segments = pathname.split("/");
  const pathLocale = segments[1];
  const locale = locales.includes(pathLocale as any)
    ? pathLocale
    : defaultLocale;

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto px-8 md:px-16 pt-24 lg:pt-0 relative z-10">
        {/* Left Side: Text Content */}
        <div className="w-full lg:w-3/5 flex flex-col justify-center items-start lg:pr-12 xl:pr-24 h-full pt-10 lg:pt-0 pb-20 lg:pb-0">
          <h1
            className="text-4xl md:text-5xl lg:text-[64px] text-[#2D2D2D] uppercase leading-[1.2] mb-12"
            style={{
              fontFamily: '"Playfair Display", "Times New Roman", Times, serif',
            }}
          >
            THE PAGE YOU ARE LOOKING
            <br />
            FOR MIGHT HAVE BEEN
            <br />
            REMOVED OR TEMPORARILY
            <br />
            UNAVAILABLE
          </h1>

          <Link
            href={`/${locale}`}
            className="px-10 py-4 bg-[#BFA273] text-white font-sans font-bold text-sm tracking-[0.1em] rounded-md hover:bg-[#A88A5C] transition-colors duration-300"
          >
            BACK TO HOME
          </Link>
        </div>

        {/* Right Side: Building Illustration */}
        <div className="w-full lg:w-2/5 flex items-end justify-end opacity-90 lg:h-screen lg:absolute lg:right-0 lg:bottom-0 pointer-events-none">
          <BuildingGraphic />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[1400px] mx-auto px-8 md:px-16 pb-8 z-10 relative">
        <p className="text-[#888888] text-xs font-sans tracking-wide">
          Copyright &copy; Busrom {currentYear}. All Rights Reserved
        </p>
      </div>
    </div>
  );
}

function BuildingGraphic() {
  // Generates abstract isometric buildings matching the design aesthetic
  return (
    <svg
      viewBox="0 0 600 800"
      className="w-full max-w-[600px] h-auto object-cover transform translate-x-12 translate-y-12 lg:translate-x-0 lg:translate-y-0"
      preserveAspectRatio="xMaxYMax meet"
    >
      <g fill="#BFA273" transform="translate(300, 150) scale(1.1)">
        {/* Building 1 (Far Left) */}
        {generateBuilding(-250, 400, 4, 18, 12, 20, 4)}
        {/* Building 2 */}
        {generateBuilding(-150, 300, 5, 25, 12, 20, 4)}
        {/* Building 3 (Tallest Center) */}
        {generateBuilding(-20, 100, 6, 35, 12, 20, 4)}
        {/* Building 4 */}
        {generateBuilding(110, 250, 4, 22, 12, 20, 4)}
        {/* Building 5 (Far Right) */}
        {generateBuilding(200, 350, 3, 15, 12, 20, 4)}
      </g>
    </svg>
  );
}

function generateBuilding(
  startX: number,
  startY: number,
  cols: number,
  rows: number,
  w: number,
  h: number,
  gap: number,
) {
  const elements = [];

  // Isometric skew angles
  const skewY = 30; // degrees
  const angleRad = (skewY * Math.PI) / 180;

  for (let c = 0; c < cols; c++) {
    // Top steps
    const offsetRows = Math.abs(c - Math.floor(cols / 2)) * 2;

    for (let r = offsetRows; r < rows; r++) {
      const x = startX + c * (w + gap);

      // Calculate isometric y displacement
      const isoYOffset = x * Math.tan(angleRad);
      const y = startY + r * (h + gap) + isoYOffset;

      // A diamond / slanted rectangle representing a window
      const points = `${x},${y} ${x + w},${y + w * Math.tan(angleRad)} ${x + w},${y + h + w * Math.tan(angleRad)} ${x},${y + h}`;

      // Introduce randomness at the bottom to create the dissolving effect
      let opacity = 1;
      let shouldRender = true;

      if (r > rows - 8) {
        const dropProb = (r - (rows - 8)) * 0.15;
        if (Math.random() < dropProb) shouldRender = false;
        opacity = 1 - (r - (rows - 8)) * 0.1;
      }

      if (shouldRender) {
        elements.push(
          <polygon
            key={`${c}-${r}`}
            points={points}
            opacity={Math.max(0.1, opacity)}
          />,
        );
      }
    }
  }
  return elements;
}
