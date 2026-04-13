import React from "react";

/**
 * Eyolo - The large SVG corner cut-out bridge used in the Banner
 */
export const EyoloCornerBridge = ({ className = "" }: { className?: string }) => (
  <svg 
    className={`text-[#415649] relative -right-px ${className}`} 
    width="86" 
    height="32" 
    viewBox="0 0 86 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M85.3511 32H0C8.17473 32 15.7118 28.9386 19.7164 23.9923L32.6592 8.00769C36.6639 3.06146 44.2025 0 52.3758 0H85.3511V32Z" 
      fill="currentColor"
    />
  </svg>
);

/**
 * Eyolo - The round SVG corner used for post images and category badges
 */
export const EyoloCornerRound = ({ className = "" }: { className?: string }) => (
  <svg 
    className={className}
    width="101" 
    height="101" 
    viewBox="0 0 101 101" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z" 
      fill="currentColor"
    />
  </svg>
);

/**
 * Eyolo - The circular Read More / Scroll Down badge
 */
export const EyoloScrollBadge = ({ className = "" }: { className?: string }) => (
  <div className={`bg-[#f6f5ed] border-8 border-[#E7E5D4] w-24 sm:w-28 rounded-full p-3 text-[15px] font-bold relative ${className}`}>
    <svg className="uppercase animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path id="circlePath" d="M 10, 50 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
      <text>
        <textPath href="#circlePath" className="font-light tracking-[0.07em] text-[10px] fill-black">
          — scroll down — read more —
        </textPath>
      </text>
    </svg>
    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ff4848]" width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 1C9 0.447715 8.55228 -2.41412e-08 8 0C7.44772 2.41412e-08 7 0.447715 7 1L9 1ZM7.29289 17.7071C7.68342 18.0976 8.31658 18.0976 8.70711 17.7071L15.0711 11.3431C15.4616 10.9526 15.4616 10.3195 15.0711 9.92893C14.6805 9.53841 14.0474 9.53841 13.6569 9.92893L8 15.5858L2.34315 9.92893C1.95262 9.53841 1.31946 9.53841 0.928933 9.92893C0.538408 10.3195 0.538408 10.9526 0.928933 11.3431L7.29289 17.7071ZM7 1L7 17L9 17L9 1L7 1Z" fill="currentColor"/>
    </svg>
  </div>
);

/**
 * Eyolo - The circular Arrow icon used in cards
 */
export const EyoloCircleArrow = ({ className = "" }: { className?: string }) => (
  <span className={`h-12 w-12 flex items-center justify-center text-white bg-white/20 rounded-full transition-transform duration-300 group-hover:rotate-45 ${className}`}>
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.99902 18.0009L18 1.99991M18 1.99991H3.59912M18 1.99991V16.4008" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
);
